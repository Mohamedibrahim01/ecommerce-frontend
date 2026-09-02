"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Home,
  Grid,
  User,
  ShoppingBag,
  Settings,
  LogOut,
  ShoppingBasket,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn, normalizeImageUrl } from "@/src/lib/utils";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import { api, setIntentionalLogout } from "@/src/components/auth/axiosInstance";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "Products", href: "/products", icon: ShoppingBasket },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

const HIDDEN_ROUTES = ["/login", "/register", "/checkout"] as const;

function NavbarSearch({ isMobile = false, onCloseMenu }: { isMobile?: boolean; onCloseMenu?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchParams.get("search") || "";
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value?.trim() || "";
    if (onCloseMenu) onCloseMenu();
    if (query) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search supplements..."
          aria-label="Search supplements"
          className="w-full h-11 pl-11 pr-4 text-base bg-white/10 text-white placeholder:text-stone-400 rounded-2xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 group-focus-within:text-emerald-600 transition-colors"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search supplements..."
        aria-label="Search supplements"
        className={cn(
          "w-full h-11 pl-11 pr-4",
          "text-base text-stone-800 placeholder:text-stone-400",
          "bg-stone-100 rounded-2xl border border-transparent",
          "transition-all duration-200",
          "focus:outline-none focus:bg-white focus:border-stone-200 focus:ring-2 focus:ring-emerald-500/20",
          "hover:bg-stone-50"
        )}
      />
    </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.isAdmin === true;
  const cartItems = useCartStore((state) => state.items);
  const [cartCount, setCartCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [badgeAnimate, setBadgeAnimate] = useState(false);

  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // Read user name directly from the persisted auth store (no extra API call needed)
  const authUser = useAuthStore((state) => state.user);
  const userName = (authUser as any)?.name || (authUser as any)?.firstName || "Account";
  const userAvatar = (authUser as any)?.avatar || (authUser as any)?.profileImageUrl || null;

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // User profile is read from authStore — no separate fetch needed

  // Profile dropdown click outside and keyboard navigation
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isProfileOpen]);



  // Logout modal Escape key support
  useEffect(() => {
    if (!isLogoutModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLogoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoutModalOpen]);

  // Existing Log Out logic relocated
  async function handleLogOut() {
    setIntentionalLogout(true);
    try {
      // Use relative path so axios instance adds withCredentials + Authorization header
      await api.post("/auth/logout");
      useCartStore.getState().clearCart();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      useAuthStore.getState().logout();
      setIntentionalLogout(false);
      router.replace("/");
    }
  }

  // Cart count sync
  useEffect(() => {
    const count = cartItems.reduce((t, i) => t + i.quantity, 0);
    if (count !== prevCount) {
      setCartCount(count);
      setPrevCount(count);
      if (count > 0) {
        setBadgeAnimate(true);
        const t = setTimeout(() => setBadgeAnimate(false), 400);
        return () => clearTimeout(t);
      }
    }
  }, [cartItems, prevCount]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Trap scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  if ((HIDDEN_ROUTES as readonly string[]).includes(pathname)) return null;

  return (
    <>
      {/* ── Navigation Bar ─────────────────────────────────────────────── */}
      <nav
        dir="ltr"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "sticky top-0 z-40 w-full",
          "transition-all duration-300",
          isScrolled
            ? "glass border-b border-stone-200/60 shadow-[0_1px_16px_rgba(0,0,0,0.06)]"
            : "bg-white/95 backdrop-blur-sm border-b border-stone-100"
        )}
      >
        <div className="container-xl flex items-center justify-between h-20 gap-4 sm:gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0"
            aria-label="PeakSupps home"
          >
            <div className="relative flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="PeakSupps Logo"
                width={48}
                height={48}
                style={{ width: "auto" }}
                className="h-10 sm:h-11 md:h-12 object-contain transition-transform duration-200 group-hover:scale-105"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-stone-900 text-base sm:text-lg md:text-xl tracking-tight">
                PEAK<span className="text-emerald-600">SUPPS</span>
              </span>
              <span className="text-[10px] sm:text-xs text-stone-400 font-bold tracking-widest uppercase mt-0.5">
                Premium Nutrition
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6 items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1">
              <Suspense fallback={<div className="w-full h-11 bg-stone-100 rounded-2xl animate-pulse" />}>
                <NavbarSearch />
              </Suspense>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative h-11 w-11 rounded-xl">
              <Link href="/cart" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-stone-800" aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className={cn(
                      "absolute -top-1 -right-1",
                      "flex items-center justify-center",
                      "h-5 w-5 min-w-[20px] px-1",
                      "rounded-full text-[11px] font-extrabold shadow-sm",
                      "bg-orange-500 text-white",
                      badgeAnimate && "animate-badge-pop"
                    )}
                    aria-live="polite"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Auth Profile Dropdown */}
            {accessToken || isGuest ? (
              <div className="relative hidden sm:block" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={cn(
                    "flex items-center gap-2 p-1 pl-2 pr-3 rounded-2xl transition-all duration-200 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                    isProfileOpen
                      ? "bg-stone-100 border-stone-200 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-stone-50 hover:border-stone-100"
                  )}
                  aria-label="User profile menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 p-[2px] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {userAvatar ? (
                        <img
                          src={normalizeImageUrl(userAvatar)}
                          alt="Profile avatar"
                          className="h-full w-full object-cover rounded-full aspect-square"
                        />
                      ) : (
                        <User className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-stone-800 max-w-[110px] truncate">
                    {userName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    role="menu"
                    aria-label="Profile options"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 transform origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-stone-100 mb-1">
                      <p className="font-extrabold text-stone-900 text-sm truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-stone-400 font-semibold mt-0.5">Verified Member</p>
                    </div>

                    <div className="px-1.5 space-y-0.5">
                      {isGuest ? (
                        <Link
                          href="/login"
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors focus:outline-none"
                        >
                          Sign In / Register
                        </Link>
                      ) : (
                        <>
                          {isAdmin && (
                            <Link
                              href="/admin/dashboard"
                              role="menuitem"
                              tabIndex={0}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors focus:bg-emerald-100 focus:outline-none"
                            >
                              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            role="menuitem"
                            tabIndex={0}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-emerald-600 transition-colors focus:bg-stone-50 focus:text-emerald-600 focus:outline-none"
                          >
                            <User className="h-4 w-4 text-stone-400" aria-hidden="true" />
                            Profile
                          </Link>
                          <Link
                            href="/orders"
                            role="menuitem"
                            tabIndex={0}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-emerald-600 transition-colors focus:bg-stone-50 focus:text-emerald-600 focus:outline-none"
                          >
                            <ShoppingBag className="h-4 w-4 text-stone-400" aria-hidden="true" />
                            Orders
                          </Link>
                          <Link
                            href="/settings"
                            role="menuitem"
                            tabIndex={0}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-emerald-600 transition-colors focus:bg-stone-50 focus:text-emerald-600 focus:outline-none"
                          >
                            <Settings className="h-4 w-4 text-stone-400" aria-hidden="true" />
                            Settings
                          </Link>
                        </>
                      )}
                    </div>

                    {!isGuest && (
                      <>
                        <div className="my-1.5 border-t border-stone-100" role="separator" />

                        <div className="px-1.5">
                          <button
                            type="button"
                            role="menuitem"
                            tabIndex={0}
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsLogoutModalOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors focus:bg-red-50 focus:text-red-700 focus:outline-none cursor-pointer text-left"
                          >
                            <LogOut className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button
                asChild
                variant="primary"
                size="default"
                className="hidden sm:flex h-11 px-6 text-base font-bold rounded-xl"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}

            {/* Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
              aria-controls="main-sidebar"
              className="h-11 w-11 rounded-xl"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-stone-800" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Sidebar Overlay ─────────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          style={{
            animation: "fade-in 0.2s ease both",
          }}
        />
      )}

      {/* ── Sidebar Panel ───────────────────────────────────────────────── */}
      <aside
        id="main-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        dir="ltr"
        className={cn(
          "fixed top-0 right-0 h-full w-80 sm:w-88 z-[60]",
          "bg-stone-900 text-white",
          "flex flex-col",
          "shadow-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="PeakSupps Logo"
              width={40}
              height={40}
              style={{ width: "auto" }}
              className="h-9 object-contain"
              unoptimized
            />
            <span className="font-extrabold text-white text-base sm:text-lg">
              PEAK<span className="text-emerald-400">SUPPS</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="px-6 py-4 border-b border-white/10">
          <Suspense fallback={<div className="w-full h-11 bg-white/10 rounded-2xl animate-pulse" />}>
            <NavbarSearch isMobile onCloseMenu={() => setIsSidebarOpen(false)} />
          </Suspense>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-4" aria-label="Sidebar navigation">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2",
                "text-base font-bold transition-all duration-150",
                pathname.startsWith("/admin")
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/80 hover:text-white"
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
              Admin Dashboard
              <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ADMIN
              </span>
            </Link>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-1",
                  "text-base font-bold transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-stone-400")}
                  aria-hidden="true"
                />
                {item.name}
                {item.name === "Cart" && cartCount > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10">
          {accessToken || isGuest ? (
            <div className="space-y-2">
              {!isGuest ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors group"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {userAvatar ? (
                      <img
                        src={normalizeImageUrl(userAvatar)}
                        alt="Profile avatar"
                        className="h-full w-full object-cover rounded-full aspect-square"
                      />
                    ) : (
                      <User className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-stone-400">View profile</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl group">
                  <div className="h-10 w-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <User className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">
                      Guest User
                    </p>
                    <p className="text-xs text-stone-400">Not signed in</p>
                  </div>
                </div>
              )}
              {isGuest ? (
                <Button asChild variant="primary" className="w-full h-11 text-base font-bold rounded-xl" size="default">
                  <Link href="/login" onClick={() => setIsSidebarOpen(false)}>
                    Sign In / Register
                  </Link>
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <Button asChild variant="primary" className="w-full h-11 text-base font-bold rounded-xl" size="default">
                <Link href="/login" onClick={() => setIsSidebarOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full h-11 text-base font-semibold text-stone-300 hover:text-white hover:bg-white/10 rounded-xl" size="default">
                <Link href="/register" onClick={() => setIsSidebarOpen(false)}>
                  Create account
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Logout Confirmation Dialog ──────────────────────────────────── */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-100 p-6 space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                <LogOut className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 id="logout-dialog-title" className="font-black text-stone-900 text-xl tracking-tight">
                  Sign out?
                </h3>
                <p id="logout-dialog-description" className="text-stone-500 text-sm font-medium">
                  Are you sure you want to sign out of your account?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl font-bold border-stone-200 text-stone-700 hover:bg-stone-50"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  handleLogOut();
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
