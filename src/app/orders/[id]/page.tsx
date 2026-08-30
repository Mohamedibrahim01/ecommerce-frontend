"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { useAuthStore } from "@/src/components/store/authStore";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import Link from "next/link";

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
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  status?: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data?.data || response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load order details");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, accessToken, router]);

  const handlePayOrder = async () => {
    try {
      setIsPaying(true);
      const paymentMock = {
        id: `PAY_${Math.random().toString(36).substring(7)}`,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        email_address: order?.user?.email || "payer@example.com"
      };

      const response = await api.put(`/orders/${id}/pay`, paymentMock);
      setOrder(response.data?.data || response.data);
      toast.success("Payment successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      setIsCancelling(true);
      const response = await api.put(`/orders/${id}/cancel`);
      
      // Update local state to reflect cancellation
      if (order) {
        setOrder({
          ...order,
          status: "Cancelled"
        });
      }
      
      toast.success(response.data?.message || "Order cancelled successfully");
      
      // Re-fetch to get latest authoritative state
      const updatedOrder = await api.get(`/orders/${id}`);
      setOrder(updatedOrder.data?.data || updatedOrder.data);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/orders" 
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </Link>
        <h1 className="text-3xl font-black text-gray-900 break-words">Order #{order._id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Order Items
            </h2>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item, index) => (
                <div key={index} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-2">
                    <img 
                      src={normalizeImageUrl(item.image)} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.qty} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-900 text-sm">
                      {formatPrice(item.qty * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Shipping
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900">Name: <span className="font-medium text-gray-600">{order.user.name}</span></p>
              <p className="text-sm font-bold text-gray-900">Email: <span className="font-medium text-gray-600">{order.user.email}</span></p>
              <p className="text-sm font-bold text-gray-900 mt-2">Address:</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              {order.isDelivered ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">Delivered on {new Date(order.deliveredAt!).toLocaleString()}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-3 rounded-xl border border-yellow-100">
                  <Truck className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">Not Delivered Yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment
            </h2>
            <p className="text-sm font-bold text-gray-900 mb-4">
              Method: <span className="font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{order.paymentMethod}</span>
            </p>

            <div className="pt-2">
              {order.isPaid ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">Paid on {new Date(order.paidAt!).toLocaleString()}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">Not Paid</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Items</span>
                <span className="font-bold text-gray-900">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Shipping</span>
                <span className="font-bold text-gray-900">{formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Tax</span>
                <span className="font-bold text-gray-900">{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-base font-black text-gray-900">Total</span>
                <span className="text-xl font-black text-emerald-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!order.isPaid && order.status !== "Cancelled" && (
                <Button 
                  onClick={handlePayOrder} 
                  loading={isPaying}
                  className="w-full rounded-xl h-12 font-bold bg-emerald-600 hover:bg-emerald-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Pay Now (Mock)
                </Button>
              )}
              
              {!order.isDelivered && order.status !== "Cancelled" && (
                <Button 
                  variant="outline"
                  onClick={handleCancelOrder} 
                  loading={isCancelling}
                  className="w-full rounded-xl h-12 font-bold text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                </Button>
              )}

              {order.status === "Cancelled" && (
                <div className="w-full text-center py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 text-sm">
                  This order has been cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
