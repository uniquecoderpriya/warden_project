"use client";

import Link from "next/link";
import { MdStar, MdFavorite, MdFavoriteBorder } from "react-icons/md";

import { Property } from "../store/slices/propertiesSlice";

export interface Product extends Property {
  // Legacy fields for compatibility
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
}

interface CardProps {
  product: Product;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export default function Card({
  product,
  onToggleFavorite,
  isFavorite = false,
}: CardProps) {
  const {
    id,
    name,
    city,
    state,
    country,
    tags,
    weather,
    isActive,
    // Legacy fields
    title,
    description,
    price,
    originalPrice,
    image,
    category,
    rating,
    reviewCount,
    inStock,
    isNew = false,
    isOnSale = false,
  } = product;

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MdStar
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Image Container */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              New
            </span>
          )}
          {isOnSale && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Sale
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(id.toString())}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
          >
            {isFavorite ? (
              <MdFavorite className="h-5 w-5 text-red-500" />
            ) : (
              <MdFavoriteBorder className="h-5 w-5 text-gray-600 hover:text-red-500" />
            )}
          </button>
        )}

        {/* Stock Status */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Category */}
        <div
          className="text-gray-500 uppercase tracking-wide mb-0.5"
          style={{ fontSize: "10px" }}
        >
          {category}
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-gray-900 mb-0.5 line-clamp-1"
          style={{ fontSize: "10px" }}
        >
          <Link href={`/properties/${id}`}>{name}</Link>
        </h3>

        {/* Location */}
        <p className="text-gray-600 mb-1" style={{ fontSize: "10px" }}>
          {city}, {state}
        </p>

        {/* Weather Info */}
        {weather?.current ? (
          <div className="flex items-center gap-0.5 mb-1">
            <span
              className="text-blue-600 font-medium"
              style={{ fontSize: "10px" }}
            >
              {weather.current.temperature}°C
            </span>
            <span className="text-gray-500" style={{ fontSize: "10px" }}>
              {weather.current.weatherCondition}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 mb-1">
            <span className="text-gray-400" style={{ fontSize: "10px" }}>
              Weather unavailable
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-0.5 mb-1">
          {tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
              style={{ fontSize: "10px" }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-gray-500" style={{ fontSize: "10px" }}>
              +{tags.length - 2}
            </span>
          )}
        </div>

        {/* Status and Action Button */}
        <div className="flex items-center justify-between">
          <span
            className={`px-1 py-0.5 rounded-full ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
            style={{ fontSize: "10px" }}
          >
            {isActive ? "Available" : "Unavailable"}
          </span>

          <button
            disabled={!isActive}
            className={`px-1.5 py-0.5 rounded font-medium transition-colors duration-200 ${
              isActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            style={{ fontSize: "10px" }}
          >
            {isActive ? "View" : "N/A"}
          </button>
        </div>
      </div>
    </div>
  );
}
