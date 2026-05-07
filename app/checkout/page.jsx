"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, MapPin, Truck, Banknote, CreditCard, ChevronRight, Loader2, CheckCircle, Wallet, Gift } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/app/AuthProvider.jsx";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: <Banknote size={20} className="text-green-600" /> },
  { id: "UPI", label: "UPI / Online Payment", desc: "Pay now via UPI, card or net banking", icon: <CreditCard size={20} className="text-blue-600" /> },
];

function formatPrice(p) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p || 0);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  // Referral first-order discount (auto-applied)
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralDiscountPercent, setReferralDiscountPercent] = useState(0);

  const [address, setAddress] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    date: "",
    deliveryTime: "",
    message: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const configRes = await api.get("/system-config").catch(() => null);
        if (configRes?.data) setSystemConfig(configRes.data);

        const adminBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
        const resolveImage = (img) => {
          if (!img) return "";
          if (img.startsWith("http")) return img;
          return `${adminBase}${img}`;
        };

        const normalizeItems = (rawItems) =>
          (rawItems || []).map(it => ({
            itemId: it.itemId?._id || it.itemId,
            name: it.name || it.itemId?.name || "",
            image: resolveImage(it.image || it.itemId?.image || ""),
            price: it.price ?? it.itemId?.price ?? 0,
            quantity: it.quantity || 1,
          }));

        if (user?._id) {
          const cartRes = await api.get(`/users/${user._id}/get-carts`).catch(() => null);
          const cartData = cartRes?.data ?? cartRes;
          const apiItems = cartData?.items || [];

          if (apiItems.length > 0) {
            setCart(normalizeItems(apiItems));
          } else {
            const stored = JSON.parse(localStorage.getItem("cart") || "{}");
            setCart(normalizeItems(stored?.items));
          }

          // Load wallet balance
          const meRes = await api.get("/users/me").catch(() => null);
          const walletBal = meRes?.data?.walletBalance || 0;
          setWalletBalance(walletBal);

          // Check first-order referral discount
          const refRes = await api.get(`/referrals/first-order-discount?userId=${user._id}`).catch((e) => {
            console.error('[Referral discount check failed]', e?.message);
            return null;
          });
          if (refRes?.data?.eligible) {
            setReferralDiscountPercent(refRes.data.discountPercent || 0);
          }
        } else {
          const stored = JSON.parse(localStorage.getItem("cart") || "{}");
          setCart(normalizeItems(stored?.items));
        }

        if (user) {
          setAddress(a => ({
            ...a,
            name: user.name || a.name,
            phoneNumber: user.phoneNumber || a.phoneNumber,
            email: user.email || a.email,
          }));
        }
      } catch { }
      finally { setLoading(false); }
    };
    loadData();
  }, [user]);

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  
  const deliveryFree = systemConfig?.deliveryChargeFreeAbove && subtotal >= systemConfig.deliveryChargeFreeAbove;
  const deliveryCharge = deliveryFree ? 0 : (systemConfig?.deliveryCharges || 0);

  const packagingFree = systemConfig?.packagingChargeFreeAbove && subtotal >= systemConfig.packagingChargeFreeAbove;
  let packagingCharge = 0;
  if (!packagingFree && systemConfig?.packagingCharges?.applySnacksPackagingCharge) {
    packagingCharge = systemConfig?.packagingCharges?.snacksPackagingCharge || 0;
  }

  const gstAmount = Math.round((subtotal * (systemConfig?.gstPercentage || 0)) / 100);

  // Referral discount: compute from percent whenever subtotal changes
  const computedReferralDiscount = referralDiscountPercent > 0
    ? Math.round((subtotal * referralDiscountPercent) / 100)
    : 0;

  const couponDiscount = coupon?.discountAmount || 0;
  const beforeWallet = subtotal + deliveryCharge + packagingCharge + gstAmount - couponDiscount - computedReferralDiscount;
  const walletUsed = useWallet ? Math.min(walletBalance, Math.max(0, beforeWallet)) : 0;
  const totalDiscount = couponDiscount + computedReferralDiscount + walletUsed;
  const total = Math.max(0, subtotal + deliveryCharge + packagingCharge + gstAmount - totalDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    setApplyingCoupon(true);
    try {
      const res = await api.post("/coupons/apply", { code: couponCode, cartTotal: subtotal });
      setCoupon({
        code: couponCode,
        discountAmount: res.data?.discountAmount || 0,
        couponId: res.data?.couponId || null,
      });
      toast.success(`Coupon applied! Saved ${formatPrice(res.data?.discountAmount)}`);
    } catch (err) {
      toast.error(err.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phoneNumber || !address.street || !address.city || !address.state || !address.zipCode) {
      return toast.error("Please fill in all required delivery fields");
    }
    if (cart.length === 0) return toast.error("Your cart is empty");
    if (paymentMethod !== "COD") {
      return toast.error("Online payment coming soon. Please use COD for now.");
    }

    setPlacing(true);
    try {
      const orderPayload = {
        userId: user?._id || null,
        isGuestOrder: !user?._id,
        items: cart.map(item => ({
          itemId: item.itemId || item._id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        paymentStatus: "Pending",
        subtotal,
        tax: gstAmount,
        shippingCharges: deliveryCharge,
        packagingCharges: packagingCharge,
        discount: totalDiscount,
        total,
        couponCode: coupon?.code || "",
        couponId: coupon?.couponId || null,
        walletAmountUsed: walletUsed,
        estimatedDelivery: address.date ? new Date(address.date) : null,
        deliveryTime: address.deliveryTime || null,
        notes: address.message || "",
      };

      const res = await api.post("/orders", orderPayload);
      if (res.data) {
        localStorage.removeItem("cart");
        toast.success("Order placed successfully!");
        router.push(`/track-order?orderId=${res.data.orderId || res.data._id}&key=track-order&mobile=${address.phoneNumber || user?.phoneNumber || ""}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment + Offers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <MapPin size={20} className="text-green-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Full Name *</label>
                  <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Phone Number *</label>
                  <input value={address.phoneNumber} onChange={e => setAddress(a => ({ ...a, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="+91 98765 43210" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                  <input value={address.email} onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="your@email.com" type="email" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Street Address *</label>
                  <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="Flat no, Building, Street" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">City *</label>
                  <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="New Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">State *</label>
                  <input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">PIN Code *</label>
                  <input value={address.zipCode} onChange={e => setAddress(a => ({ ...a, zipCode: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium"
                    placeholder="110001" maxLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Country</label>
                  <input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium" />
                </div>
                {/* <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Delivery Date (Optional)</label>
                  <input value={address.date} onChange={e => setAddress(a => ({ ...a, date: e.target.value }))}
                    type="date"
                    min={(() => {
                      const minDate = new Date();
                      minDate.setDate(minDate.getDate() + (systemConfig?.minimumDeliveryDays || 0));
                      return minDate.toISOString().split("T")[0];
                    })()}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Delivery Time (Optional)</label>
                  <input value={address.deliveryTime} onChange={e => setAddress(a => ({ ...a, deliveryTime: e.target.value }))}
                    type="time"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Custom Message (Optional)</label>
                  <textarea value={address.message} onChange={e => setAddress(a => ({ ...a, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-medium resize-y"
                    placeholder="Add a personal message for the recipient..." />
                </div> */}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <Truck size={20} className="text-green-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === pm.id ? "border-green-500" : "border-gray-300"}`}>
                      {paymentMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                    </div>
                    <div className="flex-shrink-0">{pm.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800">{pm.label}</p>
                      <p className="text-sm text-gray-500">{pm.desc}</p>
                    </div>
                    {pm.id === "UPI" && <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-black px-2 py-1 rounded-full">Coming Soon</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Referral First-Order Discount (auto-shown) */}
            {computedReferralDiscount > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <Gift size={22} className="text-green-600 shrink-0" />
                <div>
                  <p className="font-black text-green-800">🎉 Referral Reward Applied!</p>
                  <p className="text-sm text-green-700">
                    {referralDiscountPercent}% off on your first order — you're saving {formatPrice(computedReferralDiscount)}
                  </p>
                </div>
              </div>
            )}

            {/* Wallet */}
            {user && walletBalance > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                  <Wallet size={20} className="text-blue-600" /> Wallet Balance
                </h2>
                <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
                  <div>
                    <p className="font-black text-blue-800 text-lg">{formatPrice(walletBalance)}</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      {useWallet ? `Using ${formatPrice(walletUsed)} from wallet` : "Click to use wallet balance"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseWallet(v => !v)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${useWallet ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useWallet ? "right-1" : "left-1"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-black text-gray-800 text-lg">Have a Coupon?</h2>
              {coupon ? (
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-black text-green-700">Coupon "{coupon.code}" applied!</p>
                    <p className="text-sm text-green-600">You saved {formatPrice(coupon.discountAmount)}</p>
                  </div>
                  <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="ml-auto text-xs text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none font-mono font-bold uppercase"
                    placeholder="ENTER CODE" onKeyDown={e => e.key === "Enter" && applyCoupon()} />
                  <button onClick={applyCoupon} disabled={applyingCoupon}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-700 disabled:opacity-50 transition-all">
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <ShoppingBag size={20} className="text-green-600" /> Order Summary
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Your cart is empty</p>
                ) : cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && <img src={item.image} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-50 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                
                {deliveryCharge > 0 && <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatPrice(deliveryCharge)}</span></div>}
                {deliveryCharge === 0 && systemConfig?.deliveryChargeFreeAbove > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Free Delivery</span><span>₹0</span></div>}
                
                {packagingCharge > 0 && <div className="flex justify-between text-gray-600"><span>Packaging</span><span>{formatPrice(packagingCharge)}</span></div>}
                {packagingCharge === 0 && systemConfig?.packagingCharges?.applySnacksPackagingCharge && systemConfig?.packagingChargeFreeAbove > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Free Packaging</span><span>₹0</span></div>}
                
                {gstAmount > 0 && <div className="flex justify-between text-gray-600"><span>GST ({systemConfig?.gstPercentage}%)</span><span>{formatPrice(gstAmount)}</span></div>}
                {computedReferralDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Referral ({referralDiscountPercent}%)</span>
                    <span>-{formatPrice(computedReferralDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon</span><span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {walletUsed > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Wallet</span><span>-{formatPrice(walletUsed)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              {systemConfig?.deliveryChargeFreeAbove > 0 && subtotal < systemConfig.deliveryChargeFreeAbove && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-bold mb-2">
                  Add {formatPrice(systemConfig.deliveryChargeFreeAbove - subtotal)} more for free delivery!
                </div>
              )}
              
              {systemConfig?.packagingChargeFreeAbove > 0 && subtotal < systemConfig.packagingChargeFreeAbove && systemConfig?.packagingCharges?.applySnacksPackagingCharge && (
                <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 font-bold">
                  Add {formatPrice(systemConfig.packagingChargeFreeAbove - subtotal)} more for free packaging!
                </div>
              )}

              <button onClick={handlePlaceOrder} disabled={placing || cart.length === 0}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                {placing ? <><Loader2 size={20} className="animate-spin" /> Placing Order...</> : <>Place Order <ChevronRight size={20} /></>}
              </button>
              <p className="text-xs text-gray-400 text-center">
                {paymentMethod === "COD" ? "You will pay when your order is delivered" : "You will be redirected to payment gateway"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
