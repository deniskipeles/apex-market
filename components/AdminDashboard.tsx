'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Package, AlertTriangle, Activity, Plus, Search, Edit2, Trash2, CheckCircle2, ChevronRight, X, DollarSign, Eye, EyeOff } from 'lucide-react';
import { Product } from '@/lib/products';
import { Order } from './OrderTrackingView';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function AdminDashboard({
  products,
  orders,
  onAddProduct,
  onUpdateProductStock,
  onDeleteProduct,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Electronics');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImage, setNewImage] = useState('');

  // 1. Compute KPIs
  const totalSales = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 5).length;
  }, [products]);

  const activeShipmentsCount = useMemo(() => {
    return orders.filter((o) => o.status === 'processing' || o.status === 'shipping').length;
  }, [orders]);

  // 2. Computed Sales Chart Data (SVG-driven)
  const chartData = useMemo(() => {
    // Generate simulated sales for last 7 days including current orders
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Default mock baseline sales plus some added weight from orders
    const baselineSales = [450, 680, 520, 890, 710, 1120, 1450];
    if (orders.length > 0) {
      // Add order values to Sunday / latest days for dynamic feedback
      baselineSales[6] += totalSales * 0.4;
      baselineSales[5] += totalSales * 0.2;
    }
    return days.map((day, idx) => ({
      day,
      revenue: baselineSales[idx],
    }));
  }, [orders, totalSales]);

  // Computed category share
  const categoryData = useMemo(() => {
    const defaultData = {
      Electronics: 35,
      Wellness: 25,
      Fashion: 20,
      'Smart Home': 12,
      Lifestyle: 8,
    };
    return Object.entries(defaultData).map(([name, val]) => ({
      name,
      value: val,
    }));
  }, []);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newBrand && newCategory && newDesc && newPrice && newStock) {
      const parsedPrice = parseFloat(newPrice);
      const parsedStock = parseInt(newStock);

      const defaultImages = {
        Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        Wellness: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
        'Smart Home': "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80",
        Fashion: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
        Lifestyle: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
      };

      const finalImage = newImage.trim() || defaultImages[newCategory];

      const splitTags = newTags
        .toLowerCase()
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Default tags derived from category and titles
      const categoryTags = [newCategory.toLowerCase(), newBrand.toLowerCase(), ...newTitle.toLowerCase().split(' ')];
      const mergedTags = Array.from(new Set([...splitTags, ...categoryTags]));

      onAddProduct({
        name: newTitle,
        brand: newBrand,
        category: newCategory,
        description: newDesc,
        price: parsedPrice,
        stock: parsedStock,
        image: finalImage,
        tags: mergedTags,
      });

      // Reset state
      setNewTitle('');
      setNewBrand('');
      setNewDesc('');
      setNewPrice('');
      setNewStock('');
      setNewTags('');
      setNewImage('');
      setIsAddFormOpen(false);
    }
  };

  // Filtered Inventory List
  const filteredInventory = useMemo(() => {
    return products.filter((p) => {
      const lower = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-6" id="admin-dashboard">
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-900">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`border-b-2 px-4 py-2 text-sm font-bold transition-all ${
              activeTab === 'analytics'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`border-b-2 px-4 py-2 text-sm font-bold transition-all ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Inventory Management
          </button>
        </div>

        {activeTab === 'inventory' && (
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow active:scale-95"
            id="add-product-btn"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )}
      </div>

      {/* Top metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
            ${(14500 + totalSales).toFixed(2)}
          </h3>
          <p className="mt-1 text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> +12.4% vs last week
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
            {128 + orders.length}
          </h3>
          <p className="mt-1 text-[10px] text-gray-400 font-semibold">
            {orders.length} orders placed this session
          </p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Low Stock items</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
            {lowStockCount}
          </h3>
          <p className="mt-1 text-[10px] text-amber-600 font-bold">
            Needs replenishment warning
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Shipments</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/20">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
            {activeShipmentsCount}
          </h3>
          <p className="mt-1 text-[10px] text-gray-400 font-semibold">
            Currently on live tracking map
          </p>
        </div>
      </div>

      {/* View Switcher Panels */}
      {activeTab === 'analytics' ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Sales Chart */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950 md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Revenue Performance</span>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">Weekly Revenue Flow ($)</h3>

            {/* SVG Weekly Sales Bar Chart */}
            <div className="relative mt-6 h-64 w-full">
              <svg className="h-full w-full" viewBox="0 0 500 240">
                {/* Baseline grid */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-gray-800" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-gray-800" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-gray-800" />
                <line x1="30" y1="200" x2="480" y2="200" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-gray-800" />

                {/* Y Axis Legend */}
                <text x="5" y="24" fontSize="8" fill="#94a3b8" fontWeight="bold">$1.5k</text>
                <text x="5" y="84" fontSize="8" fill="#94a3b8" fontWeight="bold">$1k</text>
                <text x="5" y="144" fontSize="8" fill="#94a3b8" fontWeight="bold">$500</text>
                <text x="5" y="204" fontSize="8" fill="#94a3b8" fontWeight="bold">$0</text>

                {/* Column Bars */}
                {chartData.map((d, i) => {
                  const barWidth = 32;
                  const xOffset = 45 + i * 62;
                  // Max height mapped to 1500 revenue
                  const maxChartHeight = 170;
                  const barHeight = Math.min((d.revenue / 1500) * maxChartHeight, maxChartHeight);
                  const yOffset = 200 - barHeight;

                  return (
                    <g key={d.day}>
                      {/* Bar Background trace */}
                      <rect
                        x={xOffset}
                        y="20"
                        width={barWidth}
                        height={maxChartHeight}
                        fill="#f8fafc"
                        rx="6"
                        className="dark:fill-gray-900/40"
                      />

                      {/* Animated Active Bar */}
                      <motion.rect
                        x={xOffset}
                        y={yOffset}
                        width={barWidth}
                        height={barHeight}
                        fill="url(#emeraldGradient)"
                        rx="6"
                        initial={{ height: 0, y: 200 }}
                        animate={{ height: barHeight, y: yOffset }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />

                      {/* Label values */}
                      <text
                        x={xOffset + barWidth / 2}
                        y={yOffset - 6}
                        fontSize="8"
                        fontWeight="bold"
                        fill="#10b981"
                        textAnchor="middle"
                      >
                        ${Math.round(d.revenue)}
                      </text>

                      {/* Day Legend */}
                      <text
                        x={xOffset + barWidth / 2}
                        y="218"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#64748b"
                        textAnchor="middle"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}

                {/* Definitions */}
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Category Share ring */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sales Distribution</span>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">Share by Category</h3>

            {/* Custom SVG Radial Ring representation */}
            <div className="relative mt-8 flex flex-col items-center justify-center">
              <svg className="h-40 w-40" viewBox="0 0 100 100">
                {/* Base background ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="6" className="dark:stroke-gray-900" />

                {/* Animated category rings */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="238" strokeDashoffset="50" className="rotate-[-90deg] origin-center" />
                <circle cx="50" cy="50" r="31" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="194" strokeDashoffset="70" className="rotate-[-60deg] origin-center" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="150" strokeDashoffset="45" className="rotate-[-110deg] origin-center" />

                {/* Center text */}
                <text x="50" y="53" fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="middle" className="dark:fill-slate-400">E-Commerce</text>
              </svg>

              {/* Legends list */}
              <div className="mt-6 space-y-2 w-full text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-medium text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Electronics
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-medium text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Wellness / Fashion
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-medium text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-pink-500" /> Other Goods
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Management list view */
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-2.5 pr-4 pl-11 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-900">
                  <th className="pb-3 pl-2">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock Level</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700 dark:divide-gray-900 dark:text-gray-300">
                {filteredInventory.map((p) => {
                  const isLow = p.stock <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="py-4 pl-2 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="line-clamp-1">{p.name}</p>
                            <span className="text-[9px] text-gray-400">ID: {p.id} • {p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-gray-500">{p.category}</td>
                      <td className="py-4 font-bold text-gray-800 dark:text-gray-200">${p.price.toFixed(2)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className={isLow ? 'font-bold text-red-600' : 'font-semibold'}>
                            {p.stock} units
                          </span>

                          {/* Quick stock adjustments */}
                          <div className="ml-4 flex gap-1">
                            <button
                              onClick={() => onUpdateProductStock(p.id, Math.max(0, p.stock - 1))}
                              className="rounded bg-gray-100 px-1.5 py-0.5 font-bold text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onUpdateProductStock(p.id, p.stock + 5)}
                              className="rounded bg-gray-105 px-1.5 py-0.5 font-bold text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Dialog Modal */}
      <AnimatePresence>
        {isAddFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl dark:bg-gray-950 dark:border dark:border-gray-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-900">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Add New Product to Store</h3>
                </div>
                <button
                  onClick={() => setIsAddFormOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ApexPods Max"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Brand Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroSound"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Product['category'])}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2.5 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-gray-850 dark:bg-gray-900"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Smart Home">Smart Home</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="129.99"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock Count</label>
                    <input
                      type="number"
                      required
                      placeholder="25"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Short attractive description of the item features..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Custom Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="audio, wireless, active, limited (optional)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-... (leaves default if empty)"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="rounded-xl border border-gray-100 px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                  >
                    Publish Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
