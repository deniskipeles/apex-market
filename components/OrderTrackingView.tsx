'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Box, Truck, CheckCircle2, MapPin, RefreshCw, Compass, ShieldAlert, PackageCheck, Clock } from 'lucide-react';

export interface Order {
  id: string;
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      brand: string;
    };
    quantity: number;
  }[];
  total: number;
  date: string;
  status: 'placed' | 'processing' | 'shipping' | 'delivered';
  address: string;
  city: string;
  zip: string;
  paymentMethod: string;
  trackingStep: number; // 1 to 4
}

interface OrderTrackingViewProps {
  orders: Order[];
  onSimulateProgress: (orderId: string) => void;
  onNavigateToShop: () => void;
}

export default function OrderTrackingView({
  orders,
  onSimulateProgress,
  onNavigateToShop,
}: OrderTrackingViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  // Fallback in case state updates
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || (orders.length > 0 ? orders[0] : null);

  const getStepStatus = (currentStep: number, orderStep: number) => {
    if (orderStep > currentStep) return 'completed';
    if (orderStep === currentStep) return 'active';
    return 'pending';
  };

  const steps = [
    { title: 'Order Placed', desc: 'We have received your order details', icon: Box },
    { title: 'Processing', desc: 'Preparing and packing your goods in our warehouse', icon: Compass },
    { title: 'In Transit', desc: 'Dispatched and on its way to your destination', icon: Truck },
    { title: 'Delivered', desc: 'Successfully handed over to resident', icon: CheckCircle2 },
  ];

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-16 px-4 text-center dark:border-gray-900 dark:bg-gray-950" id="order-tracking-view">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600">
          <Truck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">No active shipments to track</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Once you complete a purchase, your real-time tracking panel will appear here!
        </p>
        <button
          onClick={onNavigateToShop}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3" id="order-tracking-view">
      {/* Left Sidebar: Placed Orders List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Your Shipments ({orders.length})</h3>
        <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto pr-1">
          {orders.map((order) => {
            const isSelected = activeOrder?.id === order.id;
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-sm'
                    : 'border-gray-100 bg-white hover:bg-gray-50 dark:border-gray-900 dark:bg-gray-950 dark:hover:bg-gray-900'
                }`}
                id={`order-select-${order.id}`}
              >
                <div className="flex justify-between items-baseline w-full">
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                    ID: #{order.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {order.date}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-xs font-semibold text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ${order.total.toFixed(2)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                    order.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : order.status === 'shipping'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content: Active Order Tracking details */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {activeOrder && (
          <>
            {/* Tracking Status Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-50 pb-5 dark:border-gray-900 md:flex-row md:items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live Delivery Node</span>
                  <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">Shipment ID: #{activeOrder.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Shipping Method: Premium Express Transit</p>
                </div>

                {/* Simulation Control */}
                <button
                  onClick={() => onSimulateProgress(activeOrder.id)}
                  disabled={activeOrder.status === 'delivered'}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                    activeOrder.status === 'delivered'
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-500'
                  }`}
                  id={`simulate-tracking-${activeOrder.id}`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${activeOrder.status !== 'delivered' && 'animate-spin'}`} />
                  Simulate Delivery Update
                </button>
              </div>

              {/* Status Timeline Grid */}
              <div className="mt-8 grid gap-6 md:grid-cols-4">
                {steps.map((st, i) => {
                  const stepNumber = i + 1;
                  const status = getStepStatus(stepNumber, activeOrder.trackingStep);
                  const Icon = st.icon;

                  return (
                    <div key={st.title} className="relative flex flex-col items-center text-center">
                      {/* Connector Line (except for last element) */}
                      {i < 3 && (
                        <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-100 -z-0 dark:bg-gray-800">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{
                              width: activeOrder.trackingStep > stepNumber ? "100%" : "0%"
                            }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      )}

                      {/* Icon Container */}
                      <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ${
                        status === 'completed'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : status === 'active'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'border-gray-100 bg-white text-gray-300 dark:border-gray-900 dark:bg-gray-950'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <h4 className="mt-3 text-xs font-bold text-gray-900 dark:text-gray-100">{st.title}</h4>
                      <p className="mt-1 text-[10px] text-gray-400 max-w-[120px] leading-normal">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Transit Map Overlay using gorgeous custom SVGs */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-900 dark:bg-gray-950">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Live Route Map Simulation</span>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">Transit Route: Warehouse ➔ Your Destination</h3>

              <div className="relative mt-4 h-60 w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                {/* SVG Map Lines & Elements */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240">
                  {/* Decorative Grid Lines */}
                  <path d="M 0,40 L 400,40 M 0,80 L 400,80 M 0,120 L 400,120 M 0,160 L 400,160 M 0,200 L 400,200" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                  <path d="M 50,0 L 50,240 M 100,0 L 100,240 M 150,0 L 150,240 M 200,0 L 200,240 M 250,0 L 250,240 M 300,0 L 300,240 M 350,0 L 350,240" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />

                  {/* Transit Highway road path (dashed) */}
                  <path
                    id="highway"
                    d="M 40,40 Q 140,40 200,120 T 360,200"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="dark:stroke-slate-800"
                  />

                  {/* Transit Highway glowing active completed route path */}
                  <path
                    d="M 40,40 Q 140,40 200,120 T 360,200"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * (activeOrder.trackingStep - 1)) / 3}
                    className="transition-all duration-1000 ease-in-out"
                  />

                  {/* Warehouse Landmark */}
                  <circle cx="40" cy="40" r="10" fill="#10b981" fillOpacity="0.2" />
                  <circle cx="40" cy="40" r="5" fill="#10b981" />
                  <text x="55" y="44" fontSize="9" fontWeight="bold" fill="#64748b" className="dark:fill-slate-400">Warehouse Hub</text>

                  {/* Destination Landmark */}
                  <circle cx="360" cy="200" r="12" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="360" cy="200" r="6" fill="#ef4444" />
                  <text x="280" y="215" fontSize="9" fontWeight="bold" fill="#ef4444">Shipping Destination</text>

                  {/* Little Delivery Truck sliding along path */}
                  {activeOrder.trackingStep < 4 && (
                    <g id="truck-marker">
                      <motion.circle
                        r="12"
                        fill="#10b981"
                        style={{
                          offsetPath: `path('M 40,40 Q 140,40 200,120 T 360,200')`,
                          offsetRotate: 'auto',
                        }}
                        animate={{
                          offsetDistance: `${((activeOrder.trackingStep - 1) / 3) * 100}%`
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="shadow"
                      />
                    </g>
                  )}
                </svg>

                {/* Tracking floating pill */}
                <div className="absolute top-4 right-4 rounded-xl bg-white/95 px-3 py-1.5 text-[10px] font-bold text-slate-800 shadow-md backdrop-blur dark:bg-slate-900/95 dark:text-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Status: {steps[activeOrder.trackingStep - 1].title}
                  </span>
                </div>
              </div>

              {/* Delivery info metadata */}
              <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-900/30 sm:grid-cols-2">
                <div className="flex gap-2.5">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Shipping Destination Address</span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {activeOrder.address}, {activeOrder.city} {activeOrder.zip}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Estimated Delivery time</span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {activeOrder.status === 'delivered' ? 'Completed & Handed Over' : '3-5 business days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
