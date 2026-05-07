"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Home, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/AuthProvider.jsx";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`).then(res => {
        if (res?.data) setOrder(res.data);
      }).catch(() => {});
    }
  }, [orderId]);

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p || 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle size={56} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully! 🎉</h1>
          <p className="text-gray-500">Thank you for ordering from Krishak Organic</p>
        </div>

        {/* Order ID */}
        {orderId && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package size={20} className="text-green-600" />
              <p className="text-sm font-bold text-gray-500">ORDER ID</p>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-wide font-mono">{orderId}</p>
            {order && (
              <p className="text-lg font-bold text-green-600 mt-3">{formatPrice(order.total)}</p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-sm text-green-800 space-y-2">
          <p className="font-bold">What happens next?</p>
          <p>• You'll receive order confirmation shortly</p>
          <p>• Track your order anytime using the Order ID</p>
          <p>• We'll notify you when your order is shipped</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/track-order?orderId=${orderId}&mobile=${user?.phoneNumber || ""}`)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl font-black text-base hover:bg-green-700 transition-all shadow-lg shadow-green-200"
          >
            <Truck size={20} />
            Track Order
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50 transition-all"
          >
            <Home size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
