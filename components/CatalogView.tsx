'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, X, ChevronDown, Check, Star } from 'lucide-react';
import { Product } from '@/lib/products';
import ProductCard from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  cartItems: { [id: string]: number };
  onAddToCart: (product: Product) => void;
  onTriggerSiteLens: (imageUrl: string, productName: string) => void;
  onOpenSiteLensModal: () => void;
  activeLensTerms: string[] | null;
  activeLensLabel: string | null;
  onClearLens: () => void;
}

export default function CatalogView({
  products,
  cartItems,
  onAddToCart,
  onTriggerSiteLens,
  onOpenSiteLensModal,
  activeLensTerms,
  activeLensLabel,
  onClearLens,
}: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    }
    return '';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Available Categories and Brands dynamically computed from products list
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMaxPrice(250);
    setSelectedBrands([]);
    setMinRating(0);
    onClearLens();
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Check Site Lens tags filter if active
      if (activeLensTerms && activeLensTerms.length > 0) {
        const matchesLens = product.tags.some((tag) =>
          activeLensTerms.includes(tag.toLowerCase())
        ) || product.name.toLowerCase().includes(activeLensLabel?.toLowerCase() || '') || product.category.toLowerCase().includes(activeLensLabel?.toLowerCase() || '');
        if (!matchesLens) return false;
      }

      // 2. Search term filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(lowerSearch) ||
          product.brand.toLowerCase().includes(lowerSearch) ||
          product.tags.some((t) => t.toLowerCase().includes(lowerSearch)) ||
          product.description.toLowerCase().includes(lowerSearch);
        if (!matchesSearch) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // 4. Max Price Filter
      if (product.price > maxPrice) {
        return false;
      }

      // 5. Brand Filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // 6. Rating Filter
      if (product.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory, maxPrice, selectedBrands, minRating, activeLensTerms, activeLensLabel]);

  return (
    <div className="flex flex-col gap-6" id="catalog-view">
      {/* Banner / Info on Lens */}
      {activeLensTerms && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-emerald-50 px-6 py-5 dark:bg-emerald-950/20 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Active AI Site Lens Filter: <span className="text-emerald-700 dark:text-emerald-400">&ldquo;{activeLensLabel}&rdquo;</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gemini analyzed the image and extracted tags: {activeLensTerms.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClearLens}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 active:scale-95 dark:bg-gray-900 dark:text-emerald-400"
          >
            <X className="h-3.5 w-3.5" /> Clear Lens
          </button>
        </div>
      )}

      {/* Main Search and Controls Panel */}
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-900 dark:bg-gray-950">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Text Search Input */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
            <input
              type="text"
              placeholder="Search products, brands, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-emerald-800"
              id="product-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Site Lens Trigger */}
          <button
            onClick={onOpenSiteLensModal}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 px-5 py-3 text-sm font-bold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 active:scale-95 dark:border-emerald-900/50 dark:bg-emerald-950/10 dark:text-emerald-400"
            id="launch-lens-btn"
          >
            <Sparkles className="h-4 w-4" />
            Search with Image
          </button>

          {/* Toggle Filter Panel */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-900 ${
              isFilterExpanded || selectedCategory !== 'All' || selectedBrands.length > 0 || minRating > 0 || maxPrice < 250
                ? 'border-emerald-100 bg-emerald-50/10 text-emerald-600 dark:border-emerald-900 dark:text-emerald-400'
                : 'border-gray-100 bg-white text-gray-700 dark:border-gray-800 dark:text-gray-300 dark:bg-gray-950'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {(selectedCategory !== 'All' || selectedBrands.length > 0 || minRating > 0 || maxPrice < 250) && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {isFilterExpanded && (
          <div className="mt-4 border-t border-gray-50 pt-4 dark:border-gray-900">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold outline-none transition-all focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute top-1/2 right-4 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Max Price</label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-100 accent-emerald-600 dark:bg-gray-800"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>$20</span>
                  <span>$250</span>
                </div>
              </div>

              {/* Brand Filter Checklist */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Brands</label>
                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {brands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ratings Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Min Rating</label>
                <div className="flex items-center gap-1 pt-1.5">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                        minRating >= stars
                          ? 'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-900/50 dark:bg-amber-950/20'
                          : 'border-gray-100 bg-gray-50 text-gray-300 hover:text-amber-300 dark:border-gray-900 dark:bg-gray-900'
                      }`}
                      title={`${stars} Stars & up`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ))}
                  {minRating > 0 && (
                    <span className="ml-1.5 text-xs font-bold text-amber-600">{minRating}.0+</span>
                  )}
                </div>
              </div>
            </div>

            {/* Clear All Controls */}
            <div className="mt-4 flex justify-end border-t border-gray-50 pt-3 dark:border-gray-900">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Products */}
      <div className="relative">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-16 px-4 text-center dark:border-gray-900 dark:bg-gray-950">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">No matching products found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              We couldn&apos;t find any goods matching your filter settings. Try relaxing your filters or search terms.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onTriggerSiteLens={onTriggerSiteLens}
                cartCount={cartItems[product.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
