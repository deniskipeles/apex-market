'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Eye, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onTriggerSiteLens: (imageUrl: string, productName: string) => void;
  cartCount: number;
}

export default function ProductCard({
  product,
  onAddToCart,
  onTriggerSiteLens,
  cartCount,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-900"
      id={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Link href={`/product/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Category Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:bg-gray-900/95 dark:text-gray-100">
          {product.category}
        </span>

        {/* Action Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Site Lens Action Button */}
          <button
            onClick={() => onTriggerSiteLens(product.image, product.name)}
            title="Scan with Site Lens"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md transition-colors hover:bg-emerald-50 active:scale-95 dark:bg-gray-800 dark:text-emerald-400 dark:hover:bg-gray-700"
            id={`site-lens-btn-${product.id}`}
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              <AlertCircle className="h-4 w-4" /> Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
          {product.brand}
        </span>

        {/* Title */}
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          <Link href={`/product/${product.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {product.rating} ({product.reviewsCount})
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 flex-1 text-xs text-gray-500 dark:text-gray-400">
          {product.description}
        </p>

        {/* Footer Area: Price & Add button */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {product.stock} items left
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 hover:shadow dark:bg-emerald-700 dark:hover:bg-emerald-600'
            }`}
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
