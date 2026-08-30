"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { StatCard } from "@/src/components/admin/StatCard";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  orderDate: string;
  status: number;
  finalAmount?: number;
  totalAmount?: number;
  customerName?: string;
  customerEmail?: string;
}

interface LowStockItem {
  id: string | number;
  name: string;
  stockQuantity?: number;
  price?: number;
  mainImageUrl?: string;
  brandName?: string;
}

const STATUS_MAP: Record<number, { text: string; color: string; icon: any }> = {
  1: { text: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  2: { text: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  3: { text: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
  4: { text: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  5: { text: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  6: { text: "Refunded", color: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch Dashboard statistics
      const response = await api.get("/Dashboard/statistics");
      const data = response.data || {};

      setStats({
        totalUsers:
          data.totalUsers ?? data.TotalUsers ?? data.usersCount ?? data.UsersCount ?? 0,
        totalOrders:
          data.totalOrders ?? data.TotalOrders ?? data.ordersCount ?? data.OrdersCount ?? 0,
        totalRevenue:
          data.totalRevenue ?? data.TotalRevenue ?? data.revenue ?? data.Revenue ?? 0,
        pendingOrders:
          data.pendingOrders ?? data.PendingOrders ?? data.pendingCount ?? data.PendingCount ?? 0,
        lowStockProducts:
          data.lowStockProducts ??
          data.LowStockProducts ??
          data.lowStockCount ??
          data.LowStockCount ??
          0,
      });

      // 2. Fetch Recent Orders strictly using GET /api/Orders/all?PageNumber=1&PageSize=5
      try {
        const ordersRes = await api.get("/Orders/all", {
          params: { PageNumber: 1, PageSize: 5 },
        });
        const ordersData = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data.orders || ordersRes.data.data || [];
        setRecentOrders(ordersData.slice(0, 5));
      } catch (ordErr) {
        console.warn("Could not load recent orders for dashboard:", ordErr);
      }

      // 3. Fetch Products for low stock analysis
      try {
        const prodsRes = await api.get("/Products", {
          params: { pageNumber: 1, pageSize: 50 },
        });
        const prodsData = Array.isArray(prodsRes.data)
          ? prodsRes.data
          : prodsRes.data.items || prodsRes.data.products || [];
        const lowStock = prodsData
          .filter((p: any) => (p.stockQuantity !== undefined ? p.stockQuantity <= 15 : false))
          .sort((a: any, b: any) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
          .slice(0, 5);
        setLowStockProducts(lowStock);
      } catch (prodErr) {
        console.warn("Could not load low stock inventory for dashboard:", prodErr);
      }

      if (isManualRefresh) {
        toast.success("Dashboard statistics refreshed");
      }
    } catch (err: any) {
      console.error("Failed to load dashboard statistics:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Could not load real-time statistics from server.";
      setError(msg);
      if (isManualRefresh) {
        toast.error("Failed to refresh statistics");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time performance metrics and business statistics for SH-Supplements."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fetchStatistics(true)}
          disabled={isLoading || isRefreshing}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh</span>
        </Button>
      </PageHeader>

      {/* Content Area */}
      {isLoading ? (
        <LoadingSkeleton type="cards" count={5} />
      ) : error ? (
        <ErrorState
          title="Statistics Unreachable"
          message={error}
          onRetry={() => fetchStatistics()}
          isRetrying={isLoading || isRefreshing}
        />
      ) : stats ? (
        <div className="space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <StatCard
              title="Total Revenue"
              value={formatPrice(stats.totalRevenue)}
              icon={DollarSign}
              colorScheme="emerald"
              description="Overall store revenue"
              trend={{ value: "+12.5%", isPositive: true }}
              index={0}
            />

            <StatCard
              title="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={ShoppingBag}
              colorScheme="blue"
              description="Completed & pending"
              trend={{ value: "+8.2%", isPositive: true }}
              index={1}
            />

            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders.toLocaleString()}
              icon={Clock}
              colorScheme="amber"
              description="Requires fulfillment"
              index={2}
            />

            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              colorScheme="purple"
              description="Registered customers"
              trend={{ value: "+5.1%", isPositive: true }}
              index={3}
            />

            <StatCard
              title="Low Stock"
              value={stats.lowStockProducts.toLocaleString()}
              icon={AlertTriangle}
              colorScheme="red"
              description="Needs replenishment"
              trend={{ value: stats.lowStockProducts > 0 ? "Attention" : "Optimal", isPositive: stats.lowStockProducts === 0 }}
              index={4}
            />
          </div>

          {/* Two Column Grid: Recent Orders & Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Section */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Recent Customer Orders</h4>
                      <p className="text-[11px] text-stone-400 font-medium">Latest 5 transactions</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-stone-100 mt-2">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((ord) => {
                      const info = STATUS_MAP[ord.status] || { text: "Unknown", color: "bg-stone-100 text-stone-600 border-stone-200", icon: Clock };
                      const Icon = info.icon;
                      return (
                        <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-stone-900 font-mono text-xs truncate">
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-stone-500 truncate">
                              {ord.customerName || ord.customerEmail || "Guest Customer"}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(ord.orderDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-black text-stone-900 text-xs">
                              {formatPrice(ord.finalAmount || ord.totalAmount || 0)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${info.color}`}>
                              <Icon className="w-3 h-3 shrink-0" />
                              {info.text}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-stone-400 text-xs font-medium">
                      No recent orders recorded yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-stone-100 flex justify-end">
                <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 w-full sm:w-auto">
                  <Link href="/admin/orders">
                    Manage Orders Catalog <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Low Stock Alerts Section */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Low Stock Inventory Alerts</h4>
                      <p className="text-[11px] text-stone-400 font-medium">Items requiring replenishment</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/products"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    Inventory <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-stone-100 mt-2">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((prod) => {
                      const stock = prod.stockQuantity || 0;
                      return (
                        <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.mainImageUrl ? (
                                <img
                                  src={normalizeImageUrl(prod.mainImageUrl)}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-stone-400" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-stone-900 text-xs truncate">
                                {prod.name}
                              </span>
                              <span className="text-[10px] text-stone-400 uppercase">
                                {prod.brandName || `ID: #${prod.id}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-stone-800 text-xs">
                              {prod.price ? formatPrice(prod.price) : "—"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                stock === 0
                                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {stock === 0 ? "Out of Stock" : `${stock} Left`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-stone-400 text-xs font-medium">
                      Optimal inventory levels. No low stock items detected.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-stone-100 flex justify-end">
                <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 w-full sm:w-auto">
                  <Link href="/admin/products">
                    Restock Products <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Summary / Status Banner */}
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-stone-800">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> Live Store Health
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  System operational & synced with database
                </h3>
                <p className="text-stone-400 text-sm max-w-xl leading-relaxed">
                  All customer orders, product inventory, and user registrations are updating in real-time. Use the navigation sidebar to manage catalog records and process returns.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  asChild
                  variant="primary"
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 px-6 h-11"
                >
                  <Link href="/admin/orders">Manage Orders</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl font-bold border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-white px-6 h-11"
                >
                  <Link href="/admin/products">View Inventory</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
