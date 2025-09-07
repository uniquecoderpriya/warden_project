"use client";

import { useState } from "react";
import { MdFilterList, MdClose } from "react-icons/md";

export interface FilterOptions {
  weatherCondition: string;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
}

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const weatherConditions = [
  { value: "", label: "All Weather" },
  { value: "clear", label: "Clear Sky" },
  { value: "cloudy", label: "Cloudy" },
  { value: "drizzle", label: "Drizzle" },
  { value: "rainy", label: "Rainy" },
  { value: "snow", label: "Snow" },
];

export default function Filter({
  onFilterChange,
  isOpen,
  onToggle,
}: FilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    weatherCondition: "",
    temperatureMin: -20,
    temperatureMax: 50,
    humidityMin: 0,
    humidityMax: 100,
  });

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      weatherCondition: "",
      temperatureMin: -20,
      temperatureMax: 50,
      humidityMin: 0,
      humidityMax: 100,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={onToggle}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
      >
        <MdFilterList className="h-5 w-5" />
        <span>Filters</span>
      </button>

      {/* Filter Panel */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Weather Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Weather Condition
            </label>
            <select
              value={filters.weatherCondition}
              onChange={(e) =>
                handleFilterChange("weatherCondition", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {weatherConditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Temperature Range (°C)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={filters.temperatureMin}
                  onChange={(e) =>
                    handleFilterChange(
                      "temperatureMin",
                      parseInt(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.temperatureMin}°C
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={filters.temperatureMax}
                  onChange={(e) =>
                    handleFilterChange(
                      "temperatureMax",
                      parseInt(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.temperatureMax}°C
                </span>
              </div>
            </div>
          </div>

          {/* Humidity Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Humidity Range (%)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.humidityMin}
                  onChange={(e) =>
                    handleFilterChange("humidityMin", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.humidityMin}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.humidityMax}
                  onChange={(e) =>
                    handleFilterChange("humidityMax", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.humidityMax}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
