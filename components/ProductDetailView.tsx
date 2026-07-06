'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Star, ShoppingCart, Sparkles, Eye, ShieldCheck, 
  AlertCircle, Check, Plus, Minus, Heart, Share2, Twitter, 
  Facebook, Link as LinkIcon, MessageSquare, ThumbsUp, User, ArrowUpRight
} from 'lucide-react';
import { Product } from '@/lib/products';
import SiteLensModal from './SiteLensModal';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
}

interface UserReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  likes: number;
}

export default function ProductDetailView({ product, allProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Site Lens state
  const [isSiteLensOpen, setIsSiteLensOpen] = useState(false);
  const [lensImageUrl, setLensImageUrl] = useState<string | null>(null);
  const [lensProductName, setLensProductName] = useState<string | null>(null);

  // Social sharing / copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Initialize state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      
      // Get live cart count
      const cachedCart = localStorage.getItem('apex_cart');
      if (cachedCart) {
        try {
          const cartData = JSON.parse(cachedCart);
          const count = Object.values(cartData).reduce((a: number, b: any) => a + Number(b), 0);
          setCartItemsCount(count);
        } catch (e) {
          console.error("Failed to parse cart on mount:", e);
        }
      }

      // Load wishlists
      const wishlists = localStorage.getItem('apex_wishlist');
      if (wishlists) {
        try {
          const wishlistIds = JSON.parse(wishlists);
          setIsWishlisted(wishlistIds.includes(product.id));
        } catch (e) {}
      }

      // Load persistent reviews
      const savedReviewsKey = `apex_reviews_${product.id}`;
      const cachedReviews = localStorage.getItem(savedReviewsKey);
      if (cachedReviews) {
        try {
          setReviews(JSON.parse(cachedReviews));
        } catch (e) {}
      } else {
        // Default initial reviews based on rating
        const defaultReviews: UserReview[] = [
          {
            id: 'rev-1',
            name: 'Sarah Jenkins',
            rating: 5,
            text: `Absolute game changer! The craftsmanship of this ${product.brand} item is stunning. It is exactly as described, works perfectly, and represents great value. Highly recommend!`,
            date: 'June 28, 2026',
            verified: true,
            likes: 24
          },
          {
            id: 'rev-2',
            name: 'Marcus Brody',
            rating: Math.floor(product.rating),
            text: `Very happy with my purchase. It feels premium and durable. Delivery was fast and customer service was incredibly supportive throughout. Only minor drawback is the packaging, but the actual product is pristine.`,
            date: 'May 14, 2026',
            verified: true,
            likes: 9
          },
          {
            id: 'rev-3',
            name: 'Elena Rostova',
            rating: 5,
            text: `Incredibly secure transaction and beautiful item. Fits the aesthetics of my space perfectly. Worth every single penny.`,
            date: 'April 02, 2026',
            verified: false,
            likes: 3
          }
        ];
        setReviews(defaultReviews);
        localStorage.setItem(savedReviewsKey, JSON.stringify(defaultReviews));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [product.id, product.rating, product.brand]);

  // Synchronize cart changes
  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    const cachedCart = localStorage.getItem('apex_cart');
    let cartData: { [id: string]: number } = {};
    if (cachedCart) {
      try {
        cartData = JSON.parse(cachedCart);
      } catch (e) {}
    }

    const currentQty = cartData[product.id] || 0;
    const addedQty = Math.min(product.stock - currentQty, quantity);
    
    if (addedQty <= 0 && currentQty >= product.stock) {
      alert("No additional stock available to add to cart!");
      return;
    }

    cartData[product.id] = currentQty + addedQty;
    localStorage.setItem('apex_cart', JSON.stringify(cartData));

    const totalCount = Object.values(cartData).reduce((a: number, b: any) => a + Number(b), 0);
    setCartItemsCount(totalCount);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    const wishlists = localStorage.getItem('apex_wishlist');
    let wishlistIds: string[] = [];
    if (wishlists) {
      try { wishlistIds = JSON.parse(wishlists); } catch (e) {}
    }

    if (wishlistIds.includes(product.id)) {
      wishlistIds = wishlistIds.filter(id => id !== product.id);
      setIsWishlisted(false);
    } else {
      wishlistIds.push(product.id);
      setIsWishlisted(true);
    }
    localStorage.setItem('apex_wishlist', JSON.stringify(wishlistIds));
  };

  // Handle Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newRev: UserReview = {
      id: `rev-user-${Date.now()}`,
      name: newReviewName,
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verified: true,
      likes: 0
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`apex_reviews_${product.id}`, JSON.stringify(updatedReviews));

    // Clear form
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewText('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Like a review
  const handleLikeReview = (reviewId: string) => {
    const updated = reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r);
    setReviews(updated);
    localStorage.setItem(`apex_reviews_${product.id}`, JSON.stringify(updated));
  };

  // Trigger site lens visually
  const triggerSiteLens = () => {
    setLensImageUrl(product.image);
    setLensProductName(product.name);
    setIsSiteLensOpen(true);
  };

  // Site Lens search redirect back to home page with lens filters
  const handleSiteLensApply = (keywords: string[], label: string) => {
    // Store terms and label in session storage so the home view can apply it immediately on mount
    sessionStorage.setItem('apex_lens_terms', JSON.stringify(keywords));
    sessionStorage.setItem('apex_lens_label', label);
    router.push('/?tab=shop');
  };

  // Generate related products
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [allProducts, product.id, product.category]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.floor(r.rating))) as 5|4|3|2|1;
      counts[star]++;
    });
    const total = reviews.length || 1;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };
  }, [reviews]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-800 dark:bg-gray-950 dark:text-gray-100 font-sans flex flex-col">
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-900 dark:bg-gray-950/90 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
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
          </Link>

          <nav className="hidden items-center gap-1.5 md:flex">
            <Link href="/?tab=shop" className="text-gray-500 hover:bg-gray-50 rounded-xl px-4 py-2 text-xs font-bold transition-all dark:hover:bg-gray-900 dark:text-gray-400">
              Shop Catalog
            </Link>
            <Link href="/?tab=cart" className="relative text-gray-500 hover:bg-gray-50 rounded-xl px-4 py-2 text-xs font-bold transition-all dark:hover:bg-gray-900 dark:text-gray-400">
              Cart Review
              {cartItemsCount > 0 && (
                <span className="ml-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <Link href="/?tab=tracking" className="text-gray-500 hover:bg-gray-50 rounded-xl px-4 py-2 text-xs font-bold transition-all dark:hover:bg-gray-900 dark:text-gray-400">
              Track Order
            </Link>
            <Link href="/?tab=profile" className="text-gray-500 hover:bg-gray-50 rounded-xl px-4 py-2 text-xs font-bold transition-all dark:hover:bg-gray-900 dark:text-gray-400">
              Profile Feed
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/?tab=cart" className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800">
              <ShoppingCart className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
        
        {/* Breadcrumb & Go Back */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link 
            href="/?tab=shop" 
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">Home</Link>
            <span>/</span>
            <span className="text-gray-500">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-semibold line-clamp-1 max-w-[200px]">{product.name}</span>
          </div>
        </div>

        {/* Dynamic Bento Box Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Side: Image display & visual action items (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                priority
              />

              {/* Float category chip */}
              <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm dark:bg-gray-900/95 dark:text-gray-100">
                {product.category}
              </span>

              {/* Floating Site Lens AI action trigger */}
              <button
                onClick={triggerSiteLens}
                className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-lg hover:bg-emerald-50 active:scale-95 dark:bg-gray-900 dark:text-emerald-400"
                title="Analyze Image with Site Lens AI"
              >
                <Eye className="h-4 w-4" /> Scan Image
              </button>
            </div>

            {/* AI Banner highlighting visual search capabilities */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-100/30 p-4 dark:border-emerald-900/30 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Gemini-Powered visual Site Lens</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Want to find similar items or search across coordinates? Click &ldquo;Scan Image&rdquo; to analyze this item&apos;s features and instantly discover related elements.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Primary Info, Pricing, Actions & Cart (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
              
              {/* Brand and Title */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                  {product.brand}
                </span>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Star Rating summary */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {product.rating}
                </span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-xs text-gray-500 font-medium">
                  {reviews.length} Customer Reviews
                </span>
              </div>

              {/* Price & Stock info */}
              <div className="flex items-end justify-between border-y border-gray-50 py-4 dark:border-gray-800">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Retail Price</span>
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-right space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Inventory</span>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {product.stock} left in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* Description summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Product Overview</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>
              </div>

              {/* Tags Area */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Keywords & Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/?tab=shop&search=${tag}`}
                      className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Interactive Purchase Controls */}
              {product.stock > 0 ? (
                <div className="space-y-4 pt-2">
                  {/* Quantity adjustment */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Quantity</span>
                    <div className="flex items-center rounded-xl border border-gray-100 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
                      <button
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-all dark:hover:bg-gray-900 dark:hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-all dark:hover:bg-gray-900 dark:hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions row: add to cart & wishlist */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                        isAdded 
                          ? 'bg-amber-500 text-white shadow-amber-500/10'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/10'
                      }`}
                      id="detail-add-to-cart"
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-4.5 w-4.5 animate-bounce" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4.5 w-4.5" /> Add {quantity} to Cart (${(product.price * quantity).toFixed(2)})
                        </>
                      )}
                    </button>

                    <button
                      onClick={toggleWishlist}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                        isWishlisted
                          ? 'border-red-100 bg-red-50 text-red-500 dark:border-red-900/50 dark:bg-red-950/20'
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-white hover:text-red-500 dark:border-gray-800 dark:bg-gray-950'
                      }`}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/20 text-center">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">Currently Out of Stock</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">We are working on replenishing our inventory soon.</p>
                </div>
              )}

              {/* Secure transaction summary card */}
              <div className="flex items-center justify-center gap-4 pt-3 text-[11px] text-gray-400 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure checkout
                </div>
                <span>•</span>
                <div>SSL encrypted payments</div>
              </div>
            </div>

            {/* Social Share Widget */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Refer & Share</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                >
                  <LinkIcon className="h-3.5 w-3.5" /> {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20${product.name}%20on%20ApexMarket!`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gray-50 text-sky-500 hover:bg-gray-100 dark:bg-gray-800"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gray-50 text-blue-600 hover:bg-gray-100 dark:bg-gray-800"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Reviews Section */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 border-t border-gray-100 pt-10 dark:border-gray-900">
          
          {/* Rating Summary (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Customer Feedback
            </h2>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-center space-y-4">
              <div className="space-y-1">
                <span className="text-5xl font-black text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400 block font-medium">out of 5 stars</span>
              </div>

              {/* Stars rendering */}
              <div className="flex justify-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs text-gray-400 block font-medium">Based on {reviews.length} authentic ratings</span>

              {/* Bar breakdown */}
              <div className="space-y-2 pt-2 text-left">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = ratingDistribution[star as 5|4|3|2|1] || 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs font-semibold">
                      <span className="w-3 text-gray-500">{star}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-current shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-400">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write a review interactive box */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Write a Review</h3>
              
              <AnimatePresence>
                {reviewSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-bold dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    Thank you! Your review has been submitted successfully and listed below as Verified.
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Rating</label>
                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                          newReviewRating >= star
                            ? 'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-900/50 dark:bg-amber-950/20'
                            : 'border-gray-100 bg-gray-50 text-gray-300 hover:text-amber-300 dark:border-gray-800 dark:bg-gray-950'
                        }`}
                      >
                        <Star className="h-4.5 w-4.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Review Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your experience with this product..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-950 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition-all active:scale-95 shadow-md"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Reviews Feed (8 columns) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Authentic Feed ({reviews.length})</h3>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                          <User className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white block">{rev.name}</span>
                          <span className="text-[10px] text-gray-400 block">{rev.date}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-800'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.verified && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/30 dark:text-emerald-400">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {rev.text}
                    </p>

                    {/* Like Action */}
                    <div className="flex items-center gap-2 pt-1.5 text-[10px] text-gray-400">
                      <button
                        onClick={() => handleLikeReview(rev.id)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" /> Helpful ({rev.likes})
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Dynamic Related Products Carousel/Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10 dark:border-gray-900 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">
                  Similar & Recommended Goods
                </h2>
                <p className="text-xs text-gray-400">Handpicked items matching the category {product.category}</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-900"
                  >
                    <Link href={`/product/${p.id}`} className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800 block">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm dark:bg-gray-900/95 dark:text-gray-100">
                        {p.category}
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {p.brand}
                      </span>
                      <Link 
                        href={`/product/${p.id}`}
                        className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors dark:text-gray-100 dark:hover:text-emerald-400"
                      >
                        {p.name}
                      </Link>

                      <div className="mt-1 flex items-center gap-1 text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          {p.rating} ({p.reviewsCount})
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ${p.price.toFixed(2)}
                        </span>
                        <Link 
                          href={`/product/${p.id}`}
                          className="rounded-lg bg-emerald-600/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
                        >
                          View Details <ArrowUpRight className="h-3 w-3 inline ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER AREA */}
      <footer className="mt-16 border-t border-gray-100 bg-white py-8 dark:border-gray-900 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-gray-900 dark:text-gray-100">
                ApexMarket
              </span>
            </Link>
            
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

      {/* SITE LENS MODAL */}
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
