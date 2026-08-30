"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  RefreshCw,
  Clock,
  Package
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { Pagination } from "@/src/components/admin/Pagination";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  status?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Status Update state
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders`);
      const data = res.data?.data || res.data || [];
      setOrders(data);
      setPageNumber(page);
      setHasMore(data.length >= PAGE_SIZE); // We could integrate actual pagination if backend supports it
    } catch (err: any) {
      console.error("Failed to load admin orders:", err);
      setError(err.response?.data?.message || "Could not retrieve orders list from backend.");
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleDeliverClick = (order: Order) => {
    setOrderToDeliver(order);
    setIsConfirmOpen(true);
  };

  const executeDeliverOrder = async () => {
    if (!orderToDeliver) return;
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderToDeliver._id}/deliver`);
      toast.success(`Order #${orderToDeliver._id.slice(0, 8).toUpperCase()} marked as delivered`);
      setIsConfirmOpen(false);
      setOrderToDeliver(null);
      if (selectedOrder?._id === orderToDeliver._id) {
        setSelectedOrder((prev) => (prev ? { ...prev, isDelivered: true, deliveredAt: new Date().toISOString() } : null));
      }
      fetchOrders(pageNumber);
    } catch (err: any) {
      console.error("Deliver status failed:", err);
      toast.error(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      o._id.toLowerCase().includes(searchLower) ||
      o.user?.email.toLowerCase().includes(searchLower) ||
      o.user?.name.toLowerCase().includes(searchLower) ||
      o.shippingAddress?.city.toLowerCase().includes(searchLower)
    );
  });

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "_id",
      cell: (o) => (
        <div>
          <span className="font-bold text-stone-900 font-mono text-xs">
            #{o._id.slice(0, 8).toUpperCase()}
          </span>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {new Date(o.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (o) => (
        <div className="max-w-xs">
          <p className="font-semibold text-stone-800 text-xs truncate">
            {o.user?.name || "Guest Customer"}
          </p>
          <p className="text-[11px] text-stone-500 truncate mt-0.5">
            {o.user?.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      header: "Total",
      cell: (o) => (
        <span className="font-black text-emerald-600 text-sm">
          {formatPrice(o.totalPrice)}
        </span>
      ),
    },
    {
      header: "Payment",
      cell: (o) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {o.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {o.isPaid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      header: "Delivery",
      cell: (o) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.isDelivered ? 'bg-blue-50 text-blue-700 border-blue-100' : o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
          {o.isDelivered ? <CheckCircle2 className="w-3 h-3" /> : o.status === 'Cancelled' ? <XCircle className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
          {o.isDelivered ? "Delivered" : o.status === "Cancelled" ? "Cancelled" : "Pending"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (o) => (
        <div className="flex items-center gap-2 justify-end">
          {!o.isDelivered && o.status !== "Cancelled" && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleDeliverClick(o)}
              className="rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold border-emerald-200"
            >
              <Truck className="w-3 h-3 mr-1.5" /> Deliver
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setSelectedOrder(o);
              setIsDetailsOpen(true);
            }}
            title="View Details"
            className="rounded-lg text-stone-600 hover:text-stone-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Orders Management"
        subtitle="Monitor customer transactions and update fulfillment statuses."
      >
        <Button
          onClick={() => fetchOrders(pageNumber)}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh List</span>
        </Button>
      </PageHeader>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order ID, email or customer name..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredOrders.length} orders
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchOrders(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            emptyMessage={
              searchQuery
                ? "No orders match the selected search."
                : "No customer orders found."
            }
          />
          {/* <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchOrders(page)}
            hasMore={hasMore}
          /> */}
        </div>
      )}

      {/* ─── Order Details Modal ────────────────────────────────────────── */}
      <FormDialog
        isOpen={isDetailsOpen && !!selectedOrder}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        title={selectedOrder ? `Order Details — #${selectedOrder._id.slice(0, 8).toUpperCase()}` : "Order Details"}
        description="Full summary of customer items, shipping destination, and payment metrics."
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Payment</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedOrder.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {selectedOrder.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Delivery</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedOrder.isDelivered ? 'bg-blue-50 text-blue-700 border-blue-100' : selectedOrder.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                    {selectedOrder.isDelivered ? <CheckCircle2 className="w-3 h-3" /> : selectedOrder.status === 'Cancelled' ? <XCircle className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                    {selectedOrder.isDelivered ? "Delivered" : selectedOrder.status === "Cancelled" ? "Cancelled" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-stone-400 uppercase">Order Date</p>
                <p className="font-semibold text-stone-900 text-sm mt-0.5">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Customer Info</p>
                <p className="font-bold text-stone-900 text-sm">
                  {selectedOrder.user?.name || "Customer Account"}
                </p>
                <p className="text-xs text-stone-500">{selectedOrder.user?.email || "No email"}</p>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Shipping Destination</p>
                <p className="text-xs font-medium text-stone-700 leading-relaxed">
                  {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 pb-2">
                Purchased Items ({selectedOrder.orderItems?.length || 0})
              </p>
              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={normalizeImageUrl(item.image)}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-contain bg-stone-50 border p-1 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-stone-900 text-sm leading-snug">{item.name}</p>
                        <p className="text-xs text-stone-400">
                          Qty: <strong className="text-stone-700">{item.qty}</strong> × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-stone-900 text-sm">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 font-medium">Final Order Amount</p>
                <p className="text-[10px] text-stone-500">Includes applicable taxes & shipping</p>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                {formatPrice(selectedOrder.totalPrice)}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-xl font-semibold"
              >
                Close Summary
              </Button>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ─── Status Update Confirmation Dialog ──────────────────────────── */}
      <ConfirmDialog
        isOpen={isConfirmOpen && !!orderToDeliver}
        onClose={() => {
          setIsConfirmOpen(false);
          setOrderToDeliver(null);
        }}
        onConfirm={executeDeliverOrder}
        title="Mark Order as Delivered"
        description={
          orderToDeliver
            ? `Are you sure you want to mark order #${orderToDeliver._id.slice(0, 8).toUpperCase()} as Delivered?`
            : "Confirm status change?"
        }
        confirmText="Confirm Delivery"
        variant="default"
        isLoading={isUpdating}
      />
    </div>
  );
}
