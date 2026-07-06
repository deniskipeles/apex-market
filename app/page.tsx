'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Eye, User, Settings, Package, Sparkles, Share2, Twitter, Facebook, Link, Check, Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import NextLink from 'next/link';
import { INITIAL_PRODUCTS, Product } from '@/lib/products';
import CatalogView from '@/components/CatalogView';
import CartCheckoutView from '@/components/CartCheckoutView';
import OrderTrackingView, { Order } from '@/components/OrderTrackingView';
import AdminDashboard from '@/components/AdminDashboard';
import UserProfileView from '@/components/UserProfileView';
import SiteLensModal from '@/components/SiteLensModal';

interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
  interests: string[];
  purchaseHistory: string[];
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Core App States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<UserProfile>({
    name: 'Guest User',
    email: 'guest@apexmarket.com',
    isLoggedIn: false,
    interests: ['Electronics', 'Wellness'],
    purchaseHistory: [],
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'tracking' | 'profile' | 'admin'>('shop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Site Lens modal states
  const [isSiteLensOpen, setIsSiteLensOpen] = useState(false);
  const [lensImageUrl, setLensImageUrl] = useState<string | null>(null);
  const [lensProductName, setLensProductName] = useState<string | null>(null);
  const [activeLensTerms, setActiveLensTerms] = useState<string[] | null>(null);
  const [activeLensLabel, setActiveLensLabel] = useState<string | null>(null);

  // 1. Initial State Hydration on Mount
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      try {
        const cachedProducts = localStorage.getItem('apex_products');
        if (cachedProducts) setProducts(JSON.parse(cachedProducts));

        const cachedCart = localStorage.getItem('apex_cart');
        if (cachedCart) setCart(JSON.parse(cachedCart));

        const cachedOrders = localStorage.getItem('apex_orders');
        if (cachedOrders) setOrders(JSON.parse(cachedOrders));

        const cachedUser = localStorage.getItem('apex_user');
        if (cachedUser) setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Failed to load local state:", e);
      }

      // Restore active tab from query parameter if present (e.g. ?tab=cart)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryTab = urlParams.get('tab');
        if (queryTab && ['shop', 'cart', 'tracking', 'profile', 'admin'].includes(queryTab)) {
          setActiveTab(queryTab as any);
        }
      } catch (e) {}

      // Retrieve and apply any Site Lens search terms initiated from product details
      try {
        const storedTerms = sessionStorage.getItem('apex_lens_terms');
        const storedLabel = sessionStorage.getItem('apex_lens_label');
        if (storedTerms && storedLabel) {
          setActiveLensTerms(JSON.parse(storedTerms));
          setActiveLensLabel(storedLabel);
          sessionStorage.removeItem('apex_lens_terms');
          sessionStorage.removeItem('apex_lens_label');
        }
      } catch (e) {}

      // Fetch dynamic products catalog from ApexKit database
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.products) {
            setProducts(data.products);
            localStorage.setItem('apex_products', JSON.stringify(data.products));
          }
        })
        .catch((err) => console.error("Failed to load products from ApexKit database:", err));
    }, 0);
  }, []);

  // 2. Cache synchronizers
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('apex_products', JSON.stringify(newProducts));
  };

  const saveCart = (newCart: { [id: string]: number }) => {
    setCart(newCart);
    localStorage.setItem('apex_cart', JSON.stringify(newCart));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('apex_orders', JSON.stringify(newOrders));
  };

  const saveUser = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('apex_user', JSON.stringify(newUser));
  };

  // 3. Global Action Handlers
  const handleAddToCart = (product: Product) => {
    const currentQty = cart[product.id] || 0;
    if (currentQty < product.stock) {
      const updatedCart = { ...cart, [product.id]: currentQty + 1 };
      saveCart(updatedCart);
    }
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const finalQty = Math.min(newQty, product.stock);
    const updatedCart = { ...cart, [productId]: finalQty };
    saveCart(updatedCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updatedCart = { ...cart };
    delete updatedCart[productId];
    saveCart(updatedCart);
  };

  // Formats base cart list
  const cartItemsList = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId)!;
    return { product, quantity };
  }).filter((item) => item.product !== undefined);

  const cartItemsCount = cartItemsList.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout Execution
  const handlePlaceOrder = (
    shippingDetails: { name: string; email: string; address: string; city: string; zip: string },
    paymentMethod: string
  ) => {
    const orderId = "APEX-" + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cartItemsList.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalWithTaxes = subtotal * 1.08 + (subtotal > 150 ? 0 : 9.99);

    const newOrder: Order = {
      id: orderId,
      items: cartItemsList.map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          brand: item.product.brand,
        },
        quantity: item.quantity,
      })),
      total: totalWithTaxes,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'placed',
      address: shippingDetails.address,
      city: shippingDetails.city,
      zip: shippingDetails.zip,
      paymentMethod,
      trackingStep: 1,
    };

    // Update product stock levels locally and in ApexKit
    const updatedProducts = products.map((prod) => {
      const orderQty = cart[prod.id] || 0;
      if (orderQty > 0) {
        const newStock = Math.max(0, prod.stock - orderQty);
        
        // Push stock update to ApexKit
        fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: prod.id, stock: newStock }),
        }).catch((err) => console.error("Failed to update stock in ApexKit:", err));

        return { ...prod, stock: newStock };
      }
      return prod;
    });

    saveProducts(updatedProducts);

    // Save order in ApexKit backend
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => console.error("Failed to post order to ApexKit:", err));

    // Save purchase history category in user profile
    const purchasedCategories = Array.from(new Set(cartItemsList.map((item) => item.product.category)));
    const updatedUser = {
      ...user,
      purchaseHistory: Array.from(new Set([...user.purchaseHistory, ...purchasedCategories])),
    };
    saveUser(updatedUser);

    // Add order to database & empty cart
    saveOrders([newOrder, ...orders]);
    saveCart({});

    // Redirect to Order tracking tab immediately!
    setActiveTab('tracking');
  };

  // Real-time tracking progress simulation
  const handleSimulateProgress = (orderId: string) => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const nextStep = o.trackingStep + 1;
        const statusMap: Record<number, Order['status']> = {
          1: 'placed',
          2: 'processing',
          3: 'shipping',
          4: 'delivered',
        };
        if (nextStep <= 4) {
          return {
            ...o,
            trackingStep: nextStep,
            status: statusMap[nextStep],
          };
        }
      }
      return o;
    });
    saveOrders(updatedOrders);
  };

  // Admin Actions
  const handleAdminAddProduct = (newProd: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.product) {
          saveProducts([data.product, ...products]);
        } else {
          // Local fallback in case of api issues
          const customProduct: Product = {
            ...newProd,
            id: "prod-" + (products.length + 1),
            rating: 5.0,
            reviewsCount: 1,
          };
          saveProducts([customProduct, ...products]);
        }
      })
      .catch((err) => {
        console.error("Failed to add product to ApexKit:", err);
        const customProduct: Product = {
          ...newProd,
          id: "prod-" + (products.length + 1),
          rating: 5.0,
          reviewsCount: 1,
        };
        saveProducts([customProduct, ...products]);
      });
  };

  const handleAdminUpdateStock = (productId: string, newStock: number) => {
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, stock: newStock }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.product) {
          const updated = products.map((p) => (p.id === productId ? data.product : p));
          saveProducts(updated);
        } else {
          const updated = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
          saveProducts(updated);
        }
      })
      .catch((err) => {
        console.error("Failed to update stock in ApexKit:", err);
        const updated = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
        saveProducts(updated);
      });
  };

  const handleAdminDeleteProduct = (productId: string) => {
    fetch(`/api/products?id=${productId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          const updated = products.filter((p) => p.id !== productId);
          saveProducts(updated);
        } else {
          const updated = products.filter((p) => p.id !== productId);
          saveProducts(updated);
        }
      })
      .catch((err) => {
        console.error("Failed to delete product in ApexKit:", err);
        const updated = products.filter((p) => p.id !== productId);
        saveProducts(updated);
      });
  };

  // Lens apply search
  const handleSiteLensApply = (keywords: string[], label: string) => {
    setActiveLensTerms(keywords);
    setActiveLensLabel(label);
    setActiveTab('shop');
  };

  const handleTriggerCardSiteLens = (imageUrl: string, name: string) => {
    setLensImageUrl(imageUrl);
    setLensProductName(name);
    setIsSiteLensOpen(true);
  };

  // Copy referral codes / sharing
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-800 dark:bg-gray-950 dark:text-gray-100 font-sans flex flex-col">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-900 dark:bg-gray-950/90 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('shop'); setActiveLensTerms(null); }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/10">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                ApexMarket
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                AI Site Lens Enabled
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 md:flex">
            <button
              onClick={() => setActiveTab('shop')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'shop'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Shop Catalog
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'cart'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Cart Review
              {cartItemsCount > 0 && (
                <span className="ml-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'tracking'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Track Order
              {orders.length > 0 && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping inline-block" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {user.isLoggedIn ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Profile ({user.name})</span>
                </>
              ) : (
                <span>Profile Feed</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Admin Panel
            </button>
          </nav>

          {/* Social share widget + quick trigger */}
          <div className="flex items-center gap-2">
            
            {/* Quick Auth actions in Header */}
            {user.isLoggedIn ? (
              <button
                onClick={() => {
                  saveUser({
                    name: 'Guest User',
                    email: 'guest@auramarket.com',
                    isLoggedIn: false,
                    interests: ['Electronics', 'Wellness'],
                    purchaseHistory: [],
                  });
                }}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-bold text-red-600 transition-colors dark:border-red-950/40 dark:hover:bg-red-950/20"
                title="Log Out Profile"
              >
                Log Out
              </button>
            ) : (
              <NextLink
                href="/login"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Sign In
              </NextLink>
            )}

            {/* Share Widget Toggle */}
            <div className="relative">
              <button
                onClick={() => setSocialExpanded(!socialExpanded)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                title="Refer & Share"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence>
                {socialExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl dark:border-gray-900 dark:bg-gray-950"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Share ApexMarket</span>
                    <div className="mt-2.5 space-y-1.5 text-xs font-semibold">
                      <button
                        onClick={handleCopyShareLink}
                        className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Link className="h-3.5 w-3.5" /> {copiedLink ? 'Copied' : 'Copy referral link'}
                        </span>
                        {copiedLink && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>
                      <a
                        href="https://twitter.com/intent/tweet?text=Loving%20shopping%20with%20visual%20AI%20Site%20Lens%20on%20ApexMarket!%20Check%20it%20out."
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                      >
                        <Twitter className="h-3.5 w-3.5 text-sky-500" /> Share on X
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                      >
                        <Facebook className="h-3.5 w-3.5 text-blue-600" /> Share on Facebook
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Nav Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 md:hidden dark:bg-gray-900"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-900 dark:bg-gray-950 md:hidden"
            >
              <div className="flex flex-col gap-1 text-xs font-bold">
                <button
                  onClick={() => { setActiveTab('shop'); setIsMenuOpen(false); }}
                  className={`rounded-xl px-4 py-2.5 text-left transition-all ${
                    activeTab === 'shop' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  Shop Catalog
                </button>
                <button
                  onClick={() => { setActiveTab('cart'); setIsMenuOpen(false); }}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-left transition-all ${
                    activeTab === 'cart' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  <span>Cart Review</span>
                  {cartItemsCount > 0 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('tracking'); setIsMenuOpen(false); }}
                  className={`rounded-xl px-4 py-2.5 text-left transition-all ${
                    activeTab === 'tracking' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  Track Order
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                  className={`rounded-xl px-4 py-2.5 text-left transition-all flex items-center gap-1.5 ${
                    activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  {user.isLoggedIn ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Profile ({user.name})</span>
                    </>
                  ) : (
                    <span>Profile Feed</span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                  className={`rounded-xl px-4 py-2.5 text-left transition-all ${
                    activeTab === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  Admin Panel
                </button>
                
                {/* Mobile Quick Auth Option */}
                {user.isLoggedIn ? (
                  <button
                    onClick={() => {
                      saveUser({
                        name: 'Guest User',
                        email: 'guest@auramarket.com',
                        isLoggedIn: false,
                        interests: ['Electronics', 'Wellness'],
                        purchaseHistory: [],
                      });
                      setIsMenuOpen(false);
                    }}
                    className="mt-2 rounded-xl border border-red-150 px-4 py-2.5 text-left font-bold text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:hover:bg-red-950/20"
                  >
                    Log Out Profile
                  </button>
                ) : (
                  <NextLink
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 text-center rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow hover:bg-emerald-500"
                  >
                    Sign In Securely
                  </NextLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
        
        {/* Banner Section inside Dashboard (SEO keywords optimization & dynamic entry) */}
        {activeTab === 'shop' && !activeLensTerms && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 p-6 text-white shadow-lg md:p-10 mb-8">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" /> Next-Gen Shopping
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">
                Smart General Goods Catalog
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Explore premium, secure shopping for tech gadgets, home, lifestyle, and wellness products. Optimized with Gemini-powered Visual search so you can search items using real photos instantly!
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button
                  onClick={() => setIsSiteLensOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-95"
                >
                  Launch Site Lens <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Ambient visual backdrops */}
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-emerald-400/5 blur-2xl animate-pulse" />
          </div>
        )}

        {/* Dynamic Tab Switcher Render */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {activeTab === 'shop' && (
              <CatalogView
                products={products}
                cartItems={cart}
                onAddToCart={handleAddToCart}
                onTriggerSiteLens={handleTriggerCardSiteLens}
                onOpenSiteLensModal={() => { setLensImageUrl(null); setLensProductName(null); setIsSiteLensOpen(true); }}
                activeLensTerms={activeLensTerms}
                activeLensLabel={activeLensLabel}
                onClearLens={() => { setActiveLensTerms(null); setActiveLensLabel(null); }}
              />
            )}

            {activeTab === 'cart' && (
              <CartCheckoutView
                items={cartItemsList}
                onUpdateQuantity={handleUpdateCartQty}
                onRemoveItem={handleRemoveCartItem}
                onPlaceOrder={handlePlaceOrder}
                onNavigateToShop={() => setActiveTab('shop')}
              />
            )}

            {activeTab === 'tracking' && (
              <OrderTrackingView
                orders={orders}
                onSimulateProgress={handleSimulateProgress}
                onNavigateToShop={() => setActiveTab('shop')}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileView
                user={user}
                products={products}
                cartItems={cart}
                onLogin={(profile) => saveUser(profile)}
                onLogout={() => saveUser({
                  name: 'Guest User',
                  email: 'guest@apexmarket.com',
                  isLoggedIn: false,
                  interests: ['Electronics', 'Wellness'],
                  purchaseHistory: [],
                })}
                onAddToCart={handleAddToCart}
                onTriggerSiteLens={handleTriggerCardSiteLens}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                products={products}
                orders={orders}
                onAddProduct={handleAdminAddProduct}
                onUpdateProductStock={handleAdminUpdateStock}
                onDeleteProduct={handleAdminDeleteProduct}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER AREA */}
      <footer className="mt-16 border-t border-gray-100 bg-white py-8 dark:border-gray-900 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-gray-900 dark:text-gray-100">
                ApexMarket
              </span>
            </div>
            
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ApexMarket Secure E-Commerce. All rights reserved.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>SSL Secure Gateways</span>
            </div>
          </div>
        </div>
      </footer>

      {/* SITE LENS AI MODAL OVERLAY */}
      <SiteLensModal
        isOpen={isSiteLensOpen}
        onClose={() => { setIsSiteLensOpen(false); setLensImageUrl(null); setLensProductName(null); }}
        initialImageUrl={lensImageUrl}
        initialProductName={lensProductName}
        onSearchApply={handleSiteLensApply}
      />
    </div>
  );
}
