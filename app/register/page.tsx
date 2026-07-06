'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Key, Mail, User, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, CheckCircle2, Check } from 'lucide-react';

const INTEREST_OPTIONS = ['Electronics', 'Wellness', 'Smart Home', 'Fashion', 'Lifestyle'];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Electronics', 'Wellness']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    const cachedUser = localStorage.getItem('apex_user');
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        if (u && u.isLoggedIn) {
          router.replace(redirect);
        }
      } catch (e) {}
    }
  }, [router, redirect]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          metadata: {
            name,
            interests: selectedInterests,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save user to localStorage
      localStorage.setItem('apex_user', JSON.stringify(data.user));
      
      // Trigger cart/login update event across context
      window.dispatchEvent(new Event('storage'));

      setSuccess(true);
      
      // Navigate to destination
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      console.error("Registration page error:", err);
      setError(err.message || "Registration failed. Try again with a different email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-900 dark:bg-gray-950"
    >
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/10 mb-4">
          <Sparkles className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Customize your visual search feed & checkout securely
        </p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Registration Successful!</h3>
            <p className="text-xs text-gray-400 mt-1">Applying your personalization filters & loading storefront...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Your Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-3 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900 dark:focus:bg-gray-950"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-3 pl-10 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-855 dark:bg-gray-900 dark:focus:bg-gray-955"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-3 pl-10 pr-10 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-gray-855 dark:bg-gray-900 dark:focus:bg-gray-955"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Interest Multi-Select */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Select Your Shopping Interests (Tailors Recommendation Feed)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 pt-3"
              id="auth-register-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Sign Up Securely <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] dark:bg-gray-950">
      {/* Outer Go Back header */}
      <header className="p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Storefront
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Suspense fallback={
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>

      {/* Footer Details */}
      <footer className="p-6 text-center text-[10px] text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} ApexMarket Secure SSO. Built with verified SSL protocols.
      </footer>
    </div>
  );
}
