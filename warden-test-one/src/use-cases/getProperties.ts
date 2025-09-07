import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

// Weather API types
interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    relative_humidity_2m: number;
  };
}

interface WeatherFilter {
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  weatherCondition?: string;
}

// Weather condition mapping based on WMO weather codes
function getWeatherCondition(weatherCode: number): string {
  if (weatherCode === 0) return "clear";
  if (weatherCode >= 1 && weatherCode <= 3) return "cloudy";
  if (weatherCode >= 51 && weatherCode <= 57) return "drizzle";
  if (
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  )
    return "rainy";
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  )
    return "snow";
  return "unknown";
}

// Simple in-memory cache for weather data (in production, use Redis)
const weatherCache = new Map<
  string,
  { data: WeatherData; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch weather data from Open-Meteo API with caching
async function fetchWeatherData(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const now = Date.now();

  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached weather data for ${cacheKey}`);
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m`;

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Warden-Weather-App/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    weatherCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error(`Error fetching weather data for ${cacheKey}:`, error);
    return null;
  }
}

// Check if property matches weather filters
function matchesWeatherFilter(
  weatherData: WeatherData,
  filters: WeatherFilter
): boolean {
  const { current } = weatherData;

  // Temperature filter
  if (
    filters.temperatureMin !== undefined &&
    current.temperature_2m < filters.temperatureMin
  ) {
    return false;
  }
  if (
    filters.temperatureMax !== undefined &&
    current.temperature_2m > filters.temperatureMax
  ) {
    return false;
  }

  // Humidity filter (using current humidity)
  if (
    filters.humidityMin !== undefined &&
    current.relative_humidity_2m < filters.humidityMin
  ) {
    return false;
  }
  if (
    filters.humidityMax !== undefined &&
    current.relative_humidity_2m > filters.humidityMax
  ) {
    return false;
  }

  // Weather condition filter
  if (filters.weatherCondition) {
    // Use actual WMO weather codes from the API
    const condition = getWeatherCondition(current.weather_code);

    if (condition !== filters.weatherCondition) {
      return false;
    }
  }

  return true;
}

// Parse weather filters from query parameters
function parseWeatherFilters(req: Request): WeatherFilter {
  const {
    temperatureMin,
    temperatureMax,
    humidityMin,
    humidityMax,
    weatherCondition,
  } = req.query;

  return {
    temperatureMin: temperatureMin
      ? parseFloat(temperatureMin as string)
      : undefined,
    temperatureMax: temperatureMax
      ? parseFloat(temperatureMax as string)
      : undefined,
    humidityMin: humidityMin ? parseFloat(humidityMin as string) : undefined,
    humidityMax: humidityMax ? parseFloat(humidityMax as string) : undefined,
    weatherCondition: weatherCondition as string | undefined,
  };
}

// Parse pagination parameters
function parsePaginationParams(req: Request): { page: number; limit: number } {
  const { page = "1", limit = "8" } = req.query;

  return {
    page: Math.max(1, parseInt(page as string) || 1),
    limit: Math.max(1, Math.min(50, parseInt(limit as string) || 6)), // Max 50 items per page
  };
}

export function buildPropertyWhere(
  req: Request
): Prisma.PropertyWhereInput | undefined {
  const { searchText } = req.query;

  if (typeof searchText !== "string") {
    return undefined;
  }

  if (!searchText || searchText.trim().length === 0) {
    return undefined;
  }

  const query = searchText.trim();

  return {
    OR: [
      { name: { contains: query } },
      { city: { contains: query } },
      { state: { contains: query } },
    ],
  };
}

export const getProperties = async (req: Request, res: Response) => {
  try {
    // Parse weather filters and pagination
    const weatherFilters = parseWeatherFilters(req);
    const pagination = parsePaginationParams(req);
    const hasWeatherFilters = Object.values(weatherFilters).some(
      (value) => value !== undefined
    );

    console.log("Weather filters:", weatherFilters);
    console.log("Pagination:", pagination);
    console.log("Has weather filters:", hasWeatherFilters);

    // Get properties from database (text search first)
    // For weather filtering, we need to check ALL properties to ensure we don't miss any matches
    const properties = await prisma.property.findMany({
      // Remove limit to check entire database when weather filtering
      where: buildPropertyWhere(req),
    });

    console.log("Properties found:", properties.length);

    // If no weather filters, return paginated properties
    if (!hasWeatherFilters) {
      const totalCount = properties.length;
      const totalPages = Math.ceil(totalCount / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedProperties = properties.slice(startIndex, endIndex);

      return res.json({
        data: paginatedProperties,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalCount,
          limit: pagination.limit,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1,
        },
      });
    }

    // Filter properties based on weather data - OPTIMIZED VERSION
    const startTime = Date.now();
    const weatherSummary = [];

    // Filter properties with coordinates first
    const propertiesWithCoords = properties.filter((p) => p.lat && p.lng);
    console.log(
      `Processing ${propertiesWithCoords.length} properties with coordinates out of ${properties.length} total properties`
    );

    // Process weather data in parallel (much faster!)
    const weatherPromises = propertiesWithCoords.map(async (property) => {
      try {
        const weatherData = await fetchWeatherData(
          property.lat!,
          property.lng!
        );

        if (!weatherData) {
          return { property, weatherData: null };
        }

        const weatherInfo = {
          property: property.name,
          temperature: weatherData.current.temperature_2m,
          humidity: weatherData.current.relative_humidity_2m,
          weatherCode: weatherData.current.weather_code,
          condition: getWeatherCondition(weatherData.current.weather_code),
        };

        return { property, weatherData, weatherInfo };
      } catch (error) {
        console.error(`Error processing ${property.name}:`, error);
        return { property, weatherData: null };
      }
    });

    // Wait for all weather data to be fetched in parallel
    const weatherResults = await Promise.all(weatherPromises);
    const processingTime = Date.now() - startTime;
    console.log(`Weather data fetched in ${processingTime}ms`);

    // Filter and build response
    const filteredProperties = [];

    for (const { property, weatherData, weatherInfo } of weatherResults) {
      if (!weatherData || !weatherInfo) {
        continue;
      }

      weatherSummary.push(weatherInfo);

      // Check if property matches weather filters
      const matches = matchesWeatherFilter(weatherData, weatherFilters);

      if (matches) {
        // Add weather data to property response
        const propertyWithWeather = {
          ...property,
          weather: {
            current: {
              temperature: weatherData.current.temperature_2m,
              windSpeed: weatherData.current.wind_speed_10m,
              weatherCode: weatherData.current.weather_code,
              weatherCondition: getWeatherCondition(
                weatherData.current.weather_code
              ),
              time: weatherData.current.time,
              humidity: weatherData.current.relative_humidity_2m,
            },
          },
        };

        filteredProperties.push(propertyWithWeather);
      }
    }

    console.log("=== WEATHER SUMMARY ===");
    console.log(`Total properties processed: ${propertiesWithCoords.length}`);
    console.log(
      `Properties with successful weather data: ${weatherSummary.length}`
    );
    console.log("Available weather conditions:", [
      ...new Set(weatherSummary.map((w) => w.condition)),
    ]);
    console.log("Temperature range:", {
      min: Math.min(...weatherSummary.map((w) => w.temperature)),
      max: Math.max(...weatherSummary.map((w) => w.temperature)),
    });
    console.log("Humidity range:", {
      min: Math.min(...weatherSummary.map((w) => w.humidity)),
      max: Math.max(...weatherSummary.map((w) => w.humidity)),
    });
    console.log(
      `Properties matching weather filter: ${filteredProperties.length}`
    );

    // Apply pagination to filtered results
    const totalCount = filteredProperties.length;
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return res.json({
      data: paginatedProperties,
      pagination: {
        currentPage: pagination.page,
        totalPages,
        totalCount,
        limit: pagination.limit,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
