'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, CheckCircle2, Heart, Award, Key, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/products';
import ProductCard from './ProductCard';

interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
  interests: string[];
  purchaseHistory: string[];
}

interface UserProfileViewProps {
  user: UserProfile;
  products: Product[];
  cartItems: { [id: string]: number };
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
  onAddToCart: (product: Product) => void;
  onTriggerSiteLens: (imageUrl: string, productName: string) => void;
}

export default function UserProfileView({
  user,
  products,
  cartItems,
  onLogin,
  onLogout,
  onAddToCart,
  onTriggerSiteLens,
}: UserProfileViewProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Electronics', 'Wellness']);

  const INTEREST_OPTIONS = ['Electronics', 'Wellness', 'Smart Home', 'Fashion', 'Lifestyle'];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegisterMode ? 'register' : 'login',
          email: emailInput,
          password: passwordInput,
          metadata: isRegisterMode ? {
            name: nameInput || emailInput.split('@')[0],
            interests: selectedInterests,
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data.user);

      // Reset
      setEmailInput('');
      setNameInput('');
      setPasswordInput('123456');
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setAuthError(err.message || "Something went wrong. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute Personalized Recommendations
  const personalizedRecommendations = useMemo(() => {
    if (!user.isLoggedIn) {
      // Default fallback for guest: show default isRecommended products
      return products.filter((p) => p.isRecommended).slice(0, 4);
    }

    // Filter products whose category matches user's interests
    const matched = products.filter((p) => {
      // Direct category match
      const matchesCategory = user.interests.includes(p.category);
      // Or matches purchase history if any
      const matchesPurchaseCategory = user.purchaseHistory.some((histCat) => p.category === histCat);
      return matchesCategory || matchesPurchaseCategory;
    });

    // If no exact match (e.g. user cleared interests), return trending items
    if (matched.length === 0) {
      return products.slice(0, 4);
    }

    return matched.slice(0, 4);
  }, [user, products]);

  return (
    <div className="grid gap-8 lg:grid-cols-3" id="user-profile-view">
      {/* Auth / Profile Panel */}
      <div className="lg:col-span-1">
        {user.isLoggedIn ? (
          /* Profile Card */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>

            <hr className="my-5 border-gray-50 dark:border-gray-900" />

            {/* Loyalty Badges */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Apex Gold Member</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Qualifies you for premium free standard shipping</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Personalized Feed Active</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Recommendations tailored based on your selected interests</p>
                </div>
              </div>
            </div>

            <hr className="my-5 border-gray-50 dark:border-gray-900" />

            {/* Interest Badges Display */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Your Interests</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-150 py-3 text-xs font-bold text-red-600 hover:bg-red-50/50 transition-colors active:scale-95"
              id="logout-btn"
            >
              <LogOut className="h-4 w-4" /> Log Out Profile
            </button>
          </motion.div>
        ) : (
          /* Login/Register Form */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950"
          >
            <div className="flex justify-between items-baseline mb-5">
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
                {isRegisterMode ? 'Create Registered Account' : 'Sign In'}
              </h3>
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                {isRegisterMode ? 'Already registered? Login' : "Don't have account? Register"}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                />
              </div>

              {/* Interests Multi-Select (Register Mode Only) */}
              {isRegisterMode && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Interests for Recommendations</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {authError && (
                <div className="rounded-xl bg-red-50 p-3 text-[11px] font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow disabled:bg-emerald-700/55 active:scale-95 transition-all"
                id="auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isRegisterMode ? 'Complete Registration' : 'Sign In Securely'}</span>
                )}
              </button>
            </form>

            {/* Secure Sign in details footer */}
            <div className="mt-4 flex flex-col gap-2 items-center justify-center text-[10px] text-gray-400 text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <Key className="h-3.5 w-3.5" />
                <span>Instant registration saves your custom recommendation feed in browser cache</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Prefer a full-screen portal? </span>
                <a 
                  href={isRegisterMode ? "/register" : "/login"} 
                  className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Go to Dedicated Auth {isRegisterMode ? "Sign Up" : "Sign In"}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Column: Personalized Product Recommendations */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Personalized For You</h3>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
              {user.isLoggedIn ? `Curated Recommendations for ${user.name}` : 'Trending Product Recommendations'}
            </h2>
          </div>
        </div>

        {/* Personalized product card grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {personalizedRecommendations.map((product) => (
            <div key={product.id} className="relative">
              {/* Personalization Reason tag */}
              {user.isLoggedIn && (
                <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                  <Sparkles className="h-2.5 w-2.5" /> Curated
                </div>
              )}
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onTriggerSiteLens={onTriggerSiteLens}
                cartCount={cartItems[product.id] || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
