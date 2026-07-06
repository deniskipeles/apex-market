# ApexMarket - Smart AI E-Commerce

ApexMarket is a high-performance, modern e-commerce platform designed to provide a seamless and intelligent shopping experience. Built with Next.js and powered by Google's Gemini AI, it introduces "Site Lens" – a revolutionary visual search tool that allows users to find products through images.

## 🚀 Key Features

### 🔍 Site Lens (AI Visual Search)
*   **Gemini-Powered Analysis**: Upload an image or use a camera to identify products instantly.
*   **Keyword Extraction**: Automatically detects categories, colors, and styles to refine your search.
*   **Intelligent Matching**: Finds the closest matches in our extensive catalog based on visual attributes.

### 🛍️ Premium Shopping Experience
*   **Site-wide Discovery**: A polished, responsive product catalog with dynamic filtering.
*   **Personalized Recommendation Feed**: Tailored suggestions based on user interests selected during registration.
*   **Real-time Order Tracking**: Monitor your purchase journey from processing to "Out for Delivery" with live status updates.

### 💳 Secure & Elegant Checkout
*   **Frictionless Payment**: Integrated secure checkout flow with multi-step validation.
*   **Apex Platinum Rewards**: Special membership perks including free shipping for verified accounts.
*   **Promo Code System**: Dynamic coupon application for instant savings (e.g., `APEX10`).

### 📊 Admin Analytics Dashboard
*   **Business Intelligence**: High-level overview of sales trends, active orders, and inventory levels.
*   **Inventory Management**: Full CRUD capabilities to manage the product catalog in real-time.
*   **Security Controls**: Protected access for store administrators.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (AnimatePresence)
- **AI Core**: [Google Gemini API](https://ai.google.dev/) (via `@google/genai`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Hybrid approach with Local Storage & Session State for instant responsiveness.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---
*Built with ❤️ on Google AI Studio.*
