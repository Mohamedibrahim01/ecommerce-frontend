#  SH-Supplements - Premium Supplement E-Commerce Platform

**SH-Supplements** is a comprehensive and advanced e-commerce platform dedicated to selling nutritional supplements and tracking the health progress of athletes. The platform is built using the latest technologies to ensure exceptional performance and a seamless, modern user experience (Clean UI).

---

##  Tech Stack

### Frontend:
* **Framework:** Next.js 16+ 
* **Styling & UI Components:** Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
* **Icons:** Lucide React
* **State Management & Data Fetching:** React Hooks & Context API / Axios
* **Design Theme:** Premium Light Mode (Cobalt Blue `#0044CC` & Sporty Orange `#FF6600`)

### Backend (Integration in Progress):
* **Framework:** .NET Web API
* **Database:** Entity Framework Core
* **Real-time Features:** SignalR (for real-time stock reservation and FOMO triggers)
* **Background Jobs:** Hangfire (for dynamic near-expiry clearance pricing)
* **Authentication:** Secure JWT & Refresh Tokens

---

##  Key Features Implemented

1. **Authentication & Onboarding:**
   * Secure Sign In and Sign Up screens prepared for JWT token handling.
   * Dedicated Onboarding flow to capture user body metrics (Age, Weight, Height) and Fitness Goals (Bulking, Cutting, Endurance).
   * Fully structured Password Reset flow and Email Verification system (`/verify-email`).

2. **Product Catalog & Advanced Filters:**
   * High-performance catalog browsing with dynamic filtering by goal, flavor, price, and category.
   * Built-in "Smart Local Alternative" banner suggestion to promote budget-friendly local products.

3. **Smart Health Tech Components:**
   * Interactive BMI calculator providing instant status reports and tailored product recommendations.
   * "Interactive Ingredients" popovers explaining the clinical benefits of specific active compounds on click.

---

##  Project Structure

```text
├── app/                  # Next.js App Router (Pages & Routes)
│   ├── (auth)/           # Authentication Route Group (Login, Register, Onboarding)
│   ├── verify-email/     # Email Verification handler route
│   ├── layout.tsx        # Global Layout & Root Providers
│   └── page.tsx          # Store Front Home Page
├── components/           # Reusable UI Components
│   ├── ui/               # Radix-based shadcn primitives (Buttons, Inputs, Cards)
│   └── auth/             # Custom Auth forms and layout helpers
├── public/               # Static assets (Images, Logos, Brand assets)
└── tailwind.config.ts    # Custom brand color theme configuration