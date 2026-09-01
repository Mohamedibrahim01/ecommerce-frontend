"use client";

import {
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import { formatPrice } from "@/src/lib/utils";
import Link from "next/link";

interface OrderHistory {
  _id: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  status: string;
  createdAt: string;
}

export default function OrdersHistoryPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");
        // Check if data is array or wrapped in data
        const data = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
        setOrders(data);
      } catch (error) {
        toast.error("Failed loading your orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && accessToken) {
      fetchOrders();
    }
  }, [isClient, accessToken]);

  if (!isClient) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8" dir="ltr">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-gray-500 mt-1">
          View your order history and track shipments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-gray-900">No orders found</p>
            <p className="text-sm text-gray-500 mt-1 mb-6">Looks like you haven't placed any orders yet.</p>
            <Button asChild className="rounded-xl font-bold px-6">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow flex flex-col md:flex-row md:items-center justify-between"
            >
              {/* Left Details */}
              <div className="p-5 md:p-6 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Order ID
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    #{order._id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="font-black text-emerald-600 text-base">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {order.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100 w-fit">
                        <XCircle className="w-3 h-3" /> Unpaid
                      </span>
                    )}

                    {order.status === "Cancelled" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 w-fit">
                        <XCircle className="w-3 h-3" /> Cancelled
                      </span>
                    ) : order.isDelivered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 w-fit">
                        <Truck className="w-3 h-3" /> Processing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 md:p-6 md:border-l border-t md:border-t-0 border-gray-100 bg-gray-50 md:bg-transparent flex justify-end">
                <Button 
                  asChild
                  variant="outline" 
                  className="rounded-xl w-full md:w-auto font-bold text-sm bg-white hover:bg-gray-50"
                >
                  <Link href={`/orders/${order._id}`}>
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
