# ⚡ Premium Supplements — E-Commerce Frontend

A high-performance, modern e-commerce web application specialized in sports nutrition and dietary supplements. Built with **Next.js (App Router)** and **TypeScript**, seamlessly integrated with a secure Node.js/Express RESTful API.

---

## 🚀 Key Features

### 🛒 Customer Experience
- **Dynamic Catalog & Filtering:** Search products and filter by category IDs/slugs with real-time URL state synchronization.
- **Persistent Cart Engine:** Synchronized shopping cart supporting authenticated and guest user experiences.
- **Secure Authentication:** JWT-based authentication flow with refresh tokens, role-based session persistence, and client-side guest browsing.
- **Responsive Layout & Visuals:** Optimized layout featuring Next.js image fallbacks for broken URLs and skeleton loaders for smooth async data fetching.
- **Checkout & Order History:** Address selection, order placement, and dedicated `/orders/my-orders` tracking.

### 🛡️ Admin Dashboard (`/admin`)
- **Protected Layout:** Route-level guards restricting access strictly to verified admin accounts.
- **Product Management:** Full CRUD operations for catalog items with stock tracking, category association, and direct image URL handling.
- **Category Management:** Create, update, and manage categories mapped directly to MongoDB documents.
- **User Administration:** View registered users, inspect details, and manage roles.
- **Order Fulfillment:** Comprehensive customer order overview with one-click order status updates (`Delivered`).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) (Custom interceptors for Bearer tokens & 401 refresh flow)

---

## 📁 Project Architecture

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Register, Email confirmation
│   │   ├── (shop)/          # Products, Categories, Cart, Checkout
│   │   ├── admin/           # Admin Dashboard (Users, Products, Categories, Orders)
│   │   ├── profile/         # User profile & saved addresses
│   │   ├── layout.tsx       # Global root layout & Providers
│   │   └── page.tsx         # Storefront landing page
│   ├── components/
│   │   ├── shared/          # Navbar, Footer, UI wrappers
│   │   ├── ui/              # Buttons, Badges, Modals, Skeleton loaders
│   │   └── modules/         # ProductCard, CartDrawer, AdminTables
│   ├── lib/
│   │   ├── axiosInstance.ts # Configured Axios client with interceptors
│   │   └── utils.ts         # Formatting, classnames, helpers
│   ├── services/            # Modular API service handlers (auth, products, orders)
│   └── stores/              # Zustand stores (useAuthStore, useCartStore)
├── public/                  # Static assets & placeholder images
├── next.config.ts           # Remote image whitelisting & runtime config
└── package.json
