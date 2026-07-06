'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Camera, Sparkles, RefreshCw, Eye, CheckCircle2, ChevronRight, FileImage } from 'lucide-react';

interface SiteLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl: string | null;
  initialProductName: string | null;
  onSearchApply: (keywords: string[], searchLabel: string) => void;
}

interface AnalysisResult {
  detectedObject: string;
  confidence: number;
  matchTerms: string[];
  visualAnalysis: string;
}

const PRESET_DEMO_IMAGES = [
  {
    name: "Headphones",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Water Bottle",
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Travel Bag",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80",
  }
];

export default function SiteLensModal({
  isOpen,
  onClose,
  initialImageUrl,
  initialProductName,
  onSearchApply,
}: SiteLensModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Convert remote URL to base64 through our proxy or direct fetch to feed into Gemini
  const triggerAnalysis = async (imageData: string) => {
    setIsScanning(true);
    setError(null);

    try {
      let finalImageData = imageData;

      // If it's a HTTP URL (like Unsplash presets or existing product images), convert it to base64 first to avoid CORS or pass to model
      if (imageData.startsWith('http')) {
        try {
          const proxyResponse = await fetch(imageData);
          const blob = await proxyResponse.blob();
          finalImageData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.warn("Failed to pre-fetch image, sending direct. Error:", fetchErr);
        }
      }

      const response = await fetch('/api/gemini/search-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: finalImageData }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("AI Search failed: " + (err.message || "Unknown error occurred."));
    } finally {
      setIsScanning(false);
    }
  };

  // Set initial image if triggered from product card
  useEffect(() => {
    if (initialImageUrl) {
      setTimeout(() => {
        setSelectedImage(initialImageUrl);
        setSelectedName(initialProductName);
        setResult(null);
        setError(null);
        // Auto-trigger analysis for existing product images for smooth experience
        triggerAnalysis(initialImageUrl);
      }, 0);
    } else {
      setTimeout(() => {
        setSelectedImage(null);
        setSelectedName(null);
        setResult(null);
        setError(null);
      }, 0);
    }
  }, [initialImageUrl, initialProductName, isOpen]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleStartCamera = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setSelectedImage(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to access camera. Please upload an image instead.");
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        setSelectedName("Captured Photo");
        stopCamera();
        triggerAnalysis(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setSelectedName(file.name);
        triggerAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (url: string, name: string) => {
    setError(null);
    setResult(null);
    setSelectedImage(url);
    setSelectedName(name);
    // Convert preset image URL to base64 or analyze directly. Since these are absolute urls, we can fetch and base64 them, or send directly if server accepts url.
    // To be 100% safe against CORS, we can convert Unsplash presets or fetch them.
    // Let's create a base64 converter or just use preset analysis values for fast responsiveness if it's Unsplash, but we can call our api with fetched image.
    triggerAnalysis(url);
  };

  const handleApplyFilter = () => {
    if (result && result.matchTerms) {
      onSearchApply(result.matchTerms, result.detectedObject);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 flex h-[90vh] max-h-[640px] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-gray-950 dark:border dark:border-gray-800"
          id="site-lens-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-900">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Eye className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Site Lens - Visual AI Search</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Search products with any image instantly</p>
              </div>
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Image Source / Camera / Presets */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Image Source</span>

                {/* Webcam Panel */}
                {isCameraActive ? (
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={handleCapturePhoto}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-emerald-500"
                      >
                        Capture Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="rounded-full bg-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Drag and Drop Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-gray-800 dark:bg-gray-900/30"
                    >
                      {selectedImage ? (
                        <div className="absolute inset-0 p-3">
                          <Image
                            src={selectedImage}
                            alt="Selected"
                            fill
                            className="h-full w-full rounded-2xl object-cover"
                          />
                          {isScanning && (
                            <div className="absolute inset-3 overflow-hidden rounded-2xl bg-black/10">
                              {/* Scanning Line */}
                              <motion.div
                                initial={{ y: "0%" }}
                                animate={{ y: "100%" }}
                                transition={{
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  duration: 2,
                                  ease: "easeInOut"
                                }}
                                className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm transition-all group-hover:scale-110 group-hover:text-emerald-500 dark:bg-gray-900 dark:text-gray-600">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload product photo</p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Drag & drop or tap to browse</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Source Control Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartCamera}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        <Camera className="h-4 w-4" /> Use Camera
                      </button>
                      {selectedImage && (
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedName(null);
                            setResult(null);
                          }}
                          className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                          title="Clear Image"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Preset Demos */}
                {!isCameraActive && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Preset Demos (Click to Test)</span>
                    <div className="mt-1.5 flex gap-2">
                      {PRESET_DEMO_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handlePresetSelect(preset.url, preset.name)}
                          className="group relative h-12 w-12 overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:scale-105 hover:border-emerald-500 dark:border-gray-900"
                        >
                          <Image
                            src={preset.url}
                            alt={preset.name}
                            fill
                            className="h-full w-full object-cover group-hover:opacity-90"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Analysis Output */}
              <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50/30 p-5 dark:border-gray-900 dark:bg-gray-900/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Lens Insights</span>

                {isScanning && (
                  <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="mb-4 text-emerald-500"
                    >
                      <Sparkles className="h-8 w-8" />
                    </motion.div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Gemini is scanning the image...</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Deconstructing shapes, colors, and textures</p>
                  </div>
                )}

                {!isScanning && !result && !selectedImage && (
                  <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-gray-400">
                    <FileImage className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
                    <p className="text-xs">Provide a photo or click a preset to see AI analysis results.</p>
                  </div>
                )}

                {!isScanning && !result && selectedImage && (
                  <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-gray-400">
                    <LoaderOverlay />
                  </div>
                )}

                {!isScanning && result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-1 flex-col gap-4"
                  >
                    {/* Detected Object */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Detected Item</span>
                      <div className="mt-1 flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{result.detectedObject}</h4>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {Math.round(result.confidence * 100)}% Match
                        </span>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Visual Analysis</span>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {result.visualAnalysis}
                      </p>
                    </div>

                    {/* Matching Tags */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Extracted Keywords</span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {result.matchTerms.map((term, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          >
                            #{term}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA to Apply */}
                    <div className="mt-auto pt-4">
                      <button
                        onClick={handleApplyFilter}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/15 transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Filter Catalog with Site Lens
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function LoaderOverlay() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="mb-3 h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full"
      />
      <p className="text-xs text-gray-500">Initiating visual scan...</p>
    </div>
  );
}
