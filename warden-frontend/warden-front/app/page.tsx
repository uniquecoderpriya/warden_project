"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import {
  fetchProperties,
  setFilters,
  setPage,
} from "./store/slices/propertiesSlice";
import Search from "./components/search";
import Filter, { FilterOptions } from "./components/filter";
import Card, { Product } from "./components/card";
import Pagination from "./components/pagination";
import { MdFilterList } from "react-icons/md";

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { properties, pagination, loading, error, filters } = useAppSelector(
    (state) => state.properties
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Ensure component only renders on client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll detection for header shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch properties when filters change
  useEffect(() => {
    if (isClient) {
      dispatch(fetchProperties(filters));
    }
  }, [dispatch, filters, isClient]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isClient) {
        dispatch(setFilters({ searchText: searchQuery }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch, isClient]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    dispatch(setFilters({ ...filters, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Different property images
  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop"
  ];

  // Convert properties to Product format for Card component
  const products: Product[] = properties.map((property, index) => ({
    ...property,
    // Legacy fields for Card component compatibility
    title: property.name,
    description: `${property.city}, ${property.state}, ${property.country}`,
    price: 0, // Not used in property context
    image: propertyImages[index % propertyImages.length],
    category: property.tags[0] || "Property",
    rating: 4.5, // Default rating
    reviewCount: Math.floor(Math.random() * 100) + 10,
    inStock: property.isActive,
    isNew: false,
    isOnSale: false,
  }));

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${
          isScrolled
            ? "shadow-lg border-b border-gray-200"
            : "shadow-none border-b-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Warden Properties
          </h1>

          {/* Search Bar */}
          <Search
            onSearch={handleSearch}
            placeholder="Search by property name, city, or state..."
          />
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-32"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <Filter
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {pagination?.totalCount || 0} Properties Found
                </h2>
                {searchQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {favorites.length} favorites
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading properties
                </h3>
                <p className="text-gray-500">{error}</p>
              </div>
            )}

            {/* Properties Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.includes(product.id.toString())}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
