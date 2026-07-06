'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Plus, Minus, ShieldCheck, CreditCard, Truck, Check, ChevronRight, Lock, HelpCircle, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartCheckoutViewProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (shippingDetails: { name: string; email: string; address: string; city: string; zip: string }, paymentMethod: string) => void;
  onNavigateToShop: () => void;
}

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'processing';

export default function CartCheckoutView({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onNavigateToShop,
}: CartCheckoutViewProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Shipping Form State
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'card' | 'paypal' | 'apple'>('card');

  // Computed Totals
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = subtotal > 150 ? 0 : subtotal === 0 ? 0 : 9.99;
  const discountAmount = subtotal * (discountPercent / 100);
  const taxCost = (subtotal - discountAmount) * 0.08; // 8% sales tax
  const total = subtotal - discountAmount + shippingCost + taxCost;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    if (couponCode.toUpperCase() === 'APEX10') {
      setDiscountPercent(10);
      setCouponSuccess('Coupon code APEX10 applied! 10% discount subtracted.');
    } else if (couponCode.toUpperCase() === 'FREESHIP' && subtotal > 0) {
      setDiscountPercent(5); // 5% and we simulate extra saving
      setCouponSuccess('Coupon FREESHIP applied! 5% discount added.');
    } else {
      setCouponError('Invalid coupon code. Try "APEX10" for 10% off.');
    }
  };

  const handleNextToShipping = () => {
    if (items.length > 0) setStep('shipping');
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingName && shippingEmail && shippingAddress && shippingCity && shippingZip) {
      setStep('payment');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentGateway !== 'card' || (cardNumber && cardExpiry && cardCvv && cardName)) {
      setStep('processing');
      // Simulate payment processing latency
      setTimeout(() => {
        onPlaceOrder(
          {
            name: shippingName,
            email: shippingEmail,
            address: shippingAddress,
            city: shippingCity,
            zip: shippingZip,
          },
          paymentGateway === 'card' ? 'Credit Card (Visa)' : paymentGateway === 'paypal' ? 'PayPal Secure' : 'Apple Pay'
        );
      }, 2000);
    }
  };

  // Card Number Formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setCardExpiry(value);
  };

  if (items.length === 0 && step !== 'processing') {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-16 px-4 text-center dark:border-gray-900 dark:bg-gray-950">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Your shopping cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Explore our wide catalog of premium general goods and add items to your cart to checkout!
        </p>
        <button
          onClick={onNavigateToShop}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
        >
          Go Back to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3" id="cart-checkout-view">
      {/* Left Columns (Step Forms) */}
      <div className="lg:col-span-2">
        {/* Step Timelines Header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-gray-50/50 p-4 dark:bg-gray-900/30">
          <div className="flex w-full items-center justify-around">
            <button
              onClick={() => step !== 'processing' && setStep('cart')}
              className={`flex items-center gap-1.5 text-xs font-bold ${
                step === 'cart' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] dark:bg-gray-800">1</span>
              Shopping Cart
            </button>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <button
              onClick={() => step !== 'processing' && step !== 'cart' && setStep('shipping')}
              disabled={step === 'cart'}
              className={`flex items-center gap-1.5 text-xs font-bold ${
                step === 'shipping' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] dark:bg-gray-800">2</span>
              Shipping Info
            </button>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span
              className={`flex items-center gap-1.5 text-xs font-bold ${
                step === 'payment' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] dark:bg-gray-800">3</span>
              Secure Payment
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CART REVIEWS */}
          {step === 'cart' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
              key="step-cart"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Review Your Cart</h2>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-900 dark:bg-gray-950"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-emerald-600">{item.product.brand}</span>
                      <h4 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.product.name}
                      </h4>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        ${item.product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-2 py-1 dark:bg-gray-900">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="rounded-xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Next Steps CTA */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={onNavigateToShop}
                  className="rounded-xl border border-gray-100 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleNextToShipping}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/10 active:scale-95"
                >
                  Proceed to Shipping <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SHIPPING INFO */}
          {step === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
              key="step-shipping"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Shipping Details</h2>

              <form onSubmit={handleNextToPayment} className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="John Doe"
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address (For Order Tracking)</label>
                  <input
                    type="email"
                    required
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Apex Lane, Apt 4B"
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">City</label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="San Francisco"
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="94103"
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                    />
                  </div>
                </div>

                {/* Delivery Speeds */}
                <div className="mt-2 rounded-2xl bg-emerald-50/30 p-3.5 dark:bg-emerald-950/10">
                  <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                    <Truck className="h-4.5 w-4.5" />
                    <span className="text-xs font-bold">Complimentary Shipping included for you!</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-normal pl-7">
                    Your order qualifies for premium standard delivery (3-5 business days) at no cost.
                  </p>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="rounded-xl border border-gray-100 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/10 active:scale-95"
                  >
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: SECURE PAYMENT GATEWAYS */}
          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
              key="step-payment"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Secure Payment Gateways</h2>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
                {/* Gateway Toggles */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('card')}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                      paymentGateway === 'card'
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-700'
                        : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-50 dark:border-gray-800'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('paypal')}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                      paymentGateway === 'paypal'
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-700'
                        : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-50 dark:border-gray-800'
                    }`}
                  >
                    <div className="text-xs font-black italic text-blue-800 dark:text-blue-400">PayPal</div>
                    <span className="text-[10px] font-bold">PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('apple')}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                      paymentGateway === 'apple'
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-700'
                        : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-50 dark:border-gray-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100"> Pay</div>
                    <span className="text-[10px] font-bold">Apple Pay</span>
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {paymentGateway === 'card' ? (
                    <div className="space-y-4">
                      {/* Interactive Credit Card Mockup */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 p-5 text-white shadow-xl">
                        <div className="flex justify-between">
                          <span className="text-xs font-black tracking-widest uppercase">ApexMarket Platinum</span>
                          <span className="text-lg font-bold italic">VISA</span>
                        </div>
                        <div className="mt-8">
                          <span className="text-xs font-medium tracking-widest opacity-75">CARD NUMBER</span>
                          <div className="text-lg font-mono tracking-widest mt-1">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                          <div>
                            <span className="text-[9px] opacity-75">CARD HOLDER</span>
                            <div className="text-xs font-mono tracking-wide uppercase mt-0.5">
                              {cardName || 'YOUR FULL NAME'}
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[9px] opacity-75">EXPIRES</span>
                              <div className="text-xs font-mono mt-0.5">{cardExpiry || 'MM/YY'}</div>
                            </div>
                            <div>
                              <span className="text-[9px] opacity-75">CVV</span>
                              <div className="text-xs font-mono mt-0.5">{cardCvv || '•••'}</div>
                            </div>
                          </div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5" />
                      </div>

                      {/* Card Fields */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4111 2222 3333 4444"
                            className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900 font-mono"
                          />
                          <Lock className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expiration Date</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            placeholder="MM/YY"
                            className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900 font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security CVV</label>
                            <span title="3-digit security code on back"><HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" /></span>
                          </div>
                          <input
                            type="password"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            placeholder="•••"
                            className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-850 dark:bg-gray-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 dark:bg-gray-900 dark:border-gray-850">
                      <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500 animate-pulse" />
                      <h4 className="mt-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                        {paymentGateway === 'paypal' ? 'PayPal Checkout Secure Connection' : 'Apple Pay Express Connection'}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                        Safe payment connection prepared. You will authorize transaction securely during the checkout review.
                      </p>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-50 p-3 text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-semibold">256-bit SSL Secured Gateway Encrypted Connection</span>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="rounded-xl border border-gray-100 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/10 active:scale-95"
                    >
                      Submit Secure Payment <Lock className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PROCESSING STATE */}
          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              key="step-processing"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="mb-6 text-emerald-600"
              >
                <RefreshCw className="h-10 w-10" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Securing Payment Gateway Connection...</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                Verifying secure credentials and completing your order. Please do not close or refresh this window.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Order Summary (Static) */}
      <div className="flex flex-col gap-5">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Order Summary</h3>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-900 dark:bg-gray-950">
          {/* Subtotal list */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-xs">
                <span className="text-gray-500 leading-normal max-w-[70%]">
                  {item.product.name} <span className="font-bold text-gray-800 dark:text-gray-300">x{item.quantity}</span>
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-4 border-gray-50 dark:border-gray-900" />

          {/* Coupon Entry */}
          {step === 'cart' && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-gray-850 dark:bg-gray-900"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-850 dark:bg-gray-800"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-1.5 text-[11px] text-red-600">{couponError}</p>}
              {couponSuccess && <p className="mt-1.5 text-[11px] text-emerald-600">{couponSuccess}</p>}
            </div>
          )}

          {/* Cost Line Items */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800 dark:text-gray-300">${subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-gray-800 dark:text-gray-300">${taxCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shipping</span>
              <span className="font-semibold text-gray-800 dark:text-gray-300">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          <hr className="my-4 border-gray-50 dark:border-gray-900" />

          {/* Grand Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Total Due</span>
            <span className="text-xl font-black text-gray-900 dark:text-gray-100">${total.toFixed(2)}</span>
          </div>

          {/* Checkout Guarantee */}
          <div className="mt-5 flex gap-2.5 rounded-2xl bg-gray-50/50 p-3 text-[10px] text-gray-500 dark:bg-gray-900/30">
            <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <p className="leading-relaxed">
              We protect your transaction with robust encryption standards. Authorized returns available within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
