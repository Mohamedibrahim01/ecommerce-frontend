"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Share2, MessageCircle, Play } from "lucide-react";

const HIDDEN_ROUTES = ["/login", "/register", "/forgot-password"];

const FOOTER_LINKS = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Categories", href: "/categories" },
  ],
  account: [
    { name: "My Profile", href: "/profile" },
    { name: "My Orders", href: "/orders" },
    { name: "Settings", href: "/settings" },
  ],
};

const SOCIAL = [
  { name: "Instagram", icon: Share2, href: "#" },
  { name: "Twitter", icon: MessageCircle, href: "#" },
  { name: "YouTube", icon: Play, href: "#" },
];

export const Footer = () => {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer
      className="w-full bg-stone-900 text-stone-300 border-t border-stone-800"
      aria-label="Site footer"
    >
      {/* Main grid */}
      <div className="container-xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand column — takes 2 cols on lg */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="PeakSupps home">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="PeakSupps Logo"
                  width={36}
                  height={36}
                  style={{ width: "auto" }}
                  className="h-8 md:h-9 object-contain transition-transform duration-200 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-white text-sm tracking-tight">
                  SH<span className="text-emerald-400">Supplements</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium tracking-widest uppercase">
                  Premium Nutrition
                </span>
              </div>
            </Link>

            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Clinically formulated supplements for peak performance. Science-backed, transparently sourced, precision dosed.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="h-8 w-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: "Shop", links: FOOTER_LINKS.shop },
            { title: "Account", links: FOOTER_LINKS.account },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-5">
                {title}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map(({ name, href }) => (
                  <li key={name}>
                    <Link
                      href={href as any}
                      className="text-sm text-stone-400 hover:text-white transition-colors duration-150 flex items-center gap-1 group w-fit"
                    >
                      {name}
                      <ArrowUpRight
                        className="h-3 w-3 opacity-0 -translate-x-1 translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">
                Stay in the loop
              </h3>
              <p className="text-stone-400 text-sm">
                Get expert tips, new arrivals and exclusive offers.
              </p>
            </div>
            <form
              className="flex gap-2 w-full md:w-auto"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
            >
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="h-9 px-3.5 flex-1 md:w-56 text-sm bg-stone-800 text-white placeholder:text-stone-500 rounded-xl border border-stone-700 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                className="h-9 px-4 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} PeakSupps. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-stone-700">·</span>
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
