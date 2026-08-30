"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/src/components/store/cartStore";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/src/components/auth/axiosInstance";
import { OrderSummary } from "@/src/components/checkout/OrderSummary";
import { Loader2, MapPin, Tag, CheckCircle2, Plus } from "lucide-react";

import { useAuthStore } from "@/src/components/store/authStore";
import { normalizeImageUrl } from "@/src/lib/utils";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  // Custom Address State
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "Egypt"
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash on Delivery");
  
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const { items, fetchCart, clearCart } = useCartStore();

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login?redirect=/orders/checkout");
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (isClient && accessToken) {
      fetchCart();
    }
  }, [fetchCart, isClient, accessToken]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/User/addresses");
        const fetchedAddresses: Address[] = Array.isArray(response.data)
          ? response.data
          : response.data?.addresses || [];
          
        const sortedAddresses = [...fetchedAddresses].sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
        );

        setAddresses(sortedAddresses);

        if (sortedAddresses.length > 0) {
          const defaultAddress = sortedAddresses.find((a) => a.isDefault) || sortedAddresses[0];
          setSelectedAddressId(defaultAddress.id);
        } else {
          setUseCustomAddress(true);
        }
      } catch (error) {
        toast.error("Failed to load addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (accessToken) {
      fetchAddresses();
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let shippingAddressPayload;

    if (useCustomAddress || addresses.length === 0) {
      if (!customAddress.address || !customAddress.city || !customAddress.postalCode) {
        toast.error("Please fill in all address fields.");
        return;
      }
      shippingAddressPayload = { ...customAddress };
    } else {
      const selected = addresses.find(a => a.id === selectedAddressId);
      if (!selected) {
        toast.error("Please select a shipping address.");
        return;
      }
      shippingAddressPayload = {
        address: selected.street,
        city: selected.city,
        postalCode: selected.zipCode,
        country: selected.country || "Egypt",
      };
    }

    if (!items || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const orderItems = items.map(item => ({
      name: item.product.name,
      qty: item.quantity,
      image: item.product.image,
      price: item.price,
      product: item.product._id,
    }));

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 150 ? 0 : 50;
    const finalTotal = subtotal + shippingFee;

    const payload = {
      orderItems,
      shippingAddress: shippingAddressPayload,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shippingFee,
      taxPrice: 0,
      totalPrice: finalTotal
    };

    try {
      setIsSubmitting(true);
      const response = await api.post("/orders", payload);
      
      const orderId = response.data?._id || response.data?.data?._id;
      if (!orderId) {
        throw new Error("Missing Order ID in response.");
      }

      await clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error("Checkout Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to process checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12" dir="ltr">
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-gray-900">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-lg text-gray-800">
                Shipping Address
              </label>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/settings")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add / Manage Addresses
                </button>
              )}
            </div>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="animate-spin text-emerald-600 w-6 h-6" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = !useCustomAddress && selectedAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setUseCustomAddress(false);
                      }}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white"}`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {addr.city || "Saved Address"}
                          </p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed break-words">
                          {addr.street}, {addr.state}, {addr.zipCode}, {addr.country}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Address Option */}
                <div
                  onClick={() => setUseCustomAddress(true)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    useCustomAddress
                      ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${useCustomAddress ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white"}`}>
                      {useCustomAddress && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <p className="font-bold text-sm text-gray-900">
                      Use a different address for this order
                    </p>
                  </div>
                  
                  {useCustomAddress && (
                    <div className="grid grid-cols-2 gap-3 pl-8">
                      <input
                        type="text"
                        value={customAddress.address}
                        onChange={e => setCustomAddress({ ...customAddress, address: e.target.value })}
                        placeholder="Street Address"
                        className="col-span-2 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={customAddress.city}
                        onChange={e => setCustomAddress({ ...customAddress, city: e.target.value })}
                        placeholder="City"
                        className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={customAddress.postalCode}
                        onChange={e => setCustomAddress({ ...customAddress, postalCode: e.target.value })}
                        placeholder="Postal Code"
                        className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={customAddress.country}
                        onChange={e => setCustomAddress({ ...customAddress, country: e.target.value })}
                        placeholder="Country"
                        className="col-span-2 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-base">Delivery Details</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                    Enter your delivery address for this order.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={customAddress.address}
                    onChange={e => setCustomAddress({ ...customAddress, address: e.target.value })}
                    placeholder="Street Address *"
                    className="col-span-2 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    value={customAddress.city}
                    onChange={e => setCustomAddress({ ...customAddress, city: e.target.value })}
                    placeholder="City *"
                    className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    value={customAddress.postalCode}
                    onChange={e => setCustomAddress({ ...customAddress, postalCode: e.target.value })}
                    placeholder="Postal Code *"
                    className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    value={customAddress.country}
                    onChange={e => setCustomAddress({ ...customAddress, country: e.target.value })}
                    placeholder="Country *"
                    className="col-span-2 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="font-bold text-lg text-gray-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "Cash on Delivery", label: "Cash on Delivery", icon: "🚚" },
                { id: "Credit Card", label: "Credit Card (Mock Pay)", icon: "💳" },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === method.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="text-2xl">{method.icon}</div>
                  <div className="font-bold text-sm">{method.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-4">
            <label className="font-bold text-lg text-gray-700 flex items-center gap-2">
              <Tag className="w-5 h-5" /> Promo Code
              <span className="text-sm font-normal text-gray-400 ml-1">
                (Optional)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 uppercase"
                placeholder="e.g. SAVE20"
              />
              <Button
                type="button"
                onClick={() => toast.info("Promo codes coming soon!")}
                disabled={!couponCode}
                className="h-[50px] px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Order"
            )}
          </Button>
        </form>
      </div>

      <div className="md:pt-16">
        <OrderSummary />
      </div>
    </div>
  );
}
