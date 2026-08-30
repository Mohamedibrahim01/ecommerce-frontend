import { create } from "zustand";

export interface CheckoutItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CheckoutData {
  shippingAddress: string;
  paymentMethod: number;
  couponCode?: string;
  affiliateCode?: string;
  pointsToRedeem: number;
}

interface CheckoutStore {
  checkoutData: CheckoutData;
  setShippingAddress: (address: string) => void;
  setPaymentMethod: (method: number) => void;
  setCoupon: (code: string) => void;
  setPoints: (points: number) => void;

  items: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  setOrderSummary: (
    items: CheckoutItem[],
    subtotal: number,
    shippingFee: number,
    total: number,
  ) => void;

  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  checkoutData: {
    shippingAddress: "",
    paymentMethod: 1,
    couponCode: "",
    affiliateCode: "",
    pointsToRedeem: 0,
  },

  items: [],
  subtotal: 0,
  shippingFee: 0,
  total: 0,

  setShippingAddress: (shippingAddress) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, shippingAddress },
    })),
  setPaymentMethod: (paymentMethod) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, paymentMethod },
    })),
  setCoupon: (couponCode) =>
    set((state) => ({ checkoutData: { ...state.checkoutData, couponCode } })),
  setPoints: (pointsToRedeem) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, pointsToRedeem },
    })),

  setOrderSummary: (items, subtotal, shippingFee, total) =>
    set({ items, subtotal, shippingFee, total }),

  resetCheckout: () =>
    set({
      checkoutData: {
        shippingAddress: "",
        paymentMethod: 1,
        couponCode: "",
        affiliateCode: "",
        pointsToRedeem: 0,
      },
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0,
    }),
}));
