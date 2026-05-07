"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/app/AuthProvider.jsx";
import {
  Wallet, Copy, Check, Share2, Package, User, LogOut, Gift,
  ShoppingBag, Calendar, CreditCard, Clock, Truck, XCircle,
  Tag, Trophy, MapPin, Phone, Mail, Edit2, Plus, Star,
  CheckCircle, ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

function formatPrice(p) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p || 0);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  return new Date(d).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const getStatusIcon = (status) => {
  switch (status) {
    case "Delivered": return <CheckCircle size={14} className="text-green-600" />;
    case "Cancelled": case "Returned": return <XCircle size={14} className="text-red-600" />;
    case "Shipped": case "Out for Delivery": return <Truck size={14} className="text-blue-600" />;
    default: return <Clock size={14} className="text-yellow-600" />;
  }
};

const getStatusColor = (status) => {
  if (status === "Delivered") return "bg-green-50 text-green-700 border-green-300";
  if (status === "Cancelled" || status === "Returned") return "bg-red-50 text-red-700 border-red-300";
  if (status === "Shipped" || status === "Out for Delivery") return "bg-blue-50 text-blue-700 border-blue-300";
  return "bg-yellow-50 text-yellow-700 border-yellow-300";
};

const getPaymentColor = (status) => {
  if (status === "Paid") return "bg-green-50 text-green-700 border-green-300";
  if (status === "Failed") return "bg-red-50 text-red-700 border-red-300";
  if (status === "Refunded") return "bg-purple-50 text-purple-700 border-purple-300";
  return "bg-yellow-50 text-yellow-700 border-yellow-300";
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [referralConfig, setReferralConfig] = useState({ referrerWalletReward: 50, refereeDiscountPercent: 10 });

  useEffect(() => {
    if (!authUser) { router.push("/login"); return; }
    const load = async () => {
      try {
        const [meRes, configRes] = await Promise.all([
          api.get("/users/me").catch(() => null),
          api.get("/system-config").catch(() => null),
        ]);
        if (meRes?.data) setProfile(meRes.data);
        if (configRes?.data?.referral) setReferralConfig(configRes.data.referral);
      } catch {}
      finally { setLoading(false); }
    };
    load();
    fetchOrders();
  }, [authUser]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const meRes = await api.get("/users/me").catch(() => null);
      if (meRes?.data?._id) {
        const res = await api.get(`/orders?userId=${meRes.data._id}`);
        const data = res?.data ?? res;
        setOrders(Array.isArray(data) ? data : data?.orders || []);
      }
    } catch { setOrders([]); }
    finally { setOrdersLoading(false); }
  };

  const referralLink = typeof window !== "undefined" && profile?.referralCode
    ? `${window.location.origin}/signup?referralCode=${profile.referralCode}` : "";

  const handleCopyCode = async () => {
    if (!profile?.referralCode) return;
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true); toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Could not copy code"); }
  };

  const handleShare = async () => {
    const message = `Hey! 👋 Sign up on Krishak Organic using my referral code and get ${referralConfig.refereeDiscountPercent}% off your first order!\n\nCode: ${profile?.referralCode}\n${referralLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Join Krishak Organic", text: message, url: referralLink }); } catch {}
    } else {
      await navigator.clipboard.writeText(message);
      toast.success("Invite message copied!");
    }
  };

  const handleLogout = async () => { await logout(); router.push("/"); };

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>);
  }

  if (!profile) {
    return (<div className="min-h-screen flex items-center justify-center text-gray-500">Could not load profile.</div>);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-black text-gray-900">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
            {profile.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-xl truncate">{profile.name}</p>
            <p className="text-gray-500 text-sm truncate">{profile.email}</p>
            {profile.phoneNumber && <p className="text-gray-500 text-sm">{profile.phoneNumber}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <ShoppingBag size={20} className="mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-black text-gray-900">{profile.orderCount || orders.length || 0}</p>
            <p className="text-xs text-gray-500 font-bold">Orders</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <CreditCard size={20} className="mx-auto text-blue-600 mb-1" />
            <p className="text-lg font-black text-gray-900">{formatPrice(profile.totalSpent || 0)}</p>
            <p className="text-xs text-gray-500 font-bold">Spent</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <CheckCircle size={20} className="mx-auto text-emerald-600 mb-1" />
            <p className="text-2xl font-black text-gray-900">{orders.filter(o => o.orderStatus === "Delivered").length}</p>
            <p className="text-xs text-gray-500 font-bold">Delivered</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "orders", label: `Orders (${orders.length})`, icon: Package },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-bold text-center transition-all relative cursor-pointer ${activeTab === tab.id ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                <div className="flex items-center justify-center gap-2"><tab.icon size={18} /><span>{tab.label}</span></div>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Wallet */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Wallet size={20} /><p className="font-bold text-blue-100 text-sm">Wallet Balance</p></div>
                  <p className="text-4xl font-black">{formatPrice(profile.walletBalance || 0)}</p>
                  <p className="text-blue-200 text-xs mt-2">Usable at checkout on your next order</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center"><Wallet size={32} className="text-white" /></div>
              </div>
            </div>

            {/* Referral */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2"><Gift size={22} className="text-emerald-600" /><h2 className="font-black text-gray-800 text-lg">Your Referral Code</h2></div>
              <p className="text-sm text-gray-500">
                Share your code with friends. They get <span className="font-black text-green-600">{referralConfig.refereeDiscountPercent}% off</span> their first order,
                and you earn <span className="font-black text-blue-600">{formatPrice(referralConfig.referrerWalletReward)}</span> in your wallet!
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-5 py-4 text-center">
                  <p className="text-2xl font-black text-emerald-700 tracking-widest font-mono">{profile.referralCode || "—"}</p>
                </div>
                <button onClick={handleCopyCode} className="p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all shrink-0" title="Copy code">
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
              <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200">
                <Share2 size={18} /> Invite Friends & Earn
              </button>
              <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800 font-medium text-center">💡 Your code is permanent — share it anytime and keep earning!</div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all">
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingBag size={24} /> Order History ({orders.length})</h2>
            </div>
            <div className="p-6">
              {ordersLoading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><ShoppingBag size={48} className="text-gray-400" /></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                  <button onClick={() => router.push("/shop")} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"><Package size={20} className="text-white" /></div>
                            <div>
                              <span className="font-black text-lg text-gray-900">#{order.orderId || order._id}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={12} />{formatDateTime(order.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start lg:items-end gap-2">
                          <span className="font-black text-xl text-gray-900">{formatPrice(order.total)}</span>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                              {getStatusIcon(order.orderStatus)} {order.orderStatus}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${getPaymentColor(order.paymentStatus)}`}>
                              <CreditCard size={12} /> {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                          <p className="text-xs text-gray-500 font-bold mb-2">Payment Details</p>
                          <div className="flex justify-between"><span className="text-gray-500">Method:</span><span className="font-bold text-gray-900">{order.paymentMethod}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span></div>
                          {order.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax:</span><span className="font-bold text-gray-900">{formatPrice(order.tax)}</span></div>}
                          {order.shippingCharges > 0 && <div className="flex justify-between"><span className="text-gray-500">Shipping:</span><span className="font-bold text-gray-900">{formatPrice(order.shippingCharges)}</span></div>}
                          {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount:</span><span className="font-bold text-green-600">-{formatPrice(order.discount)}</span></div>}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                          <p className="text-xs text-gray-500 font-bold mb-2">Shipping Details</p>
                          {order.shippingAddress && (
                            <>
                              <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                              <p className="text-gray-600">{order.shippingAddress.phoneNumber}</p>
                              <p className="text-gray-600">{order.shippingAddress.street}</p>
                              <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            </>
                          )}
                          {order.trackingNumber && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <Truck size={14} className="text-green-600" />
                              <span className="text-xs"><span className="text-gray-500">Tracking: </span><span className="font-bold text-gray-900">{order.trackingNumber}</span></span>
                            </div>
                          )}
                          {order.estimatedDelivery && <p className="text-xs text-gray-500">Est. Delivery: {formatDate(order.estimatedDelivery)}</p>}
                        </div>
                      </div>

                      {/* Items */}
                      {order.items?.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-bold text-gray-600 mb-3">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                          <div className="flex gap-2 flex-wrap">
                            {order.items.slice(0, 5).map((item, idx) => (
                              <div key={idx} className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-2 rounded-lg font-medium text-gray-700">
                                <span>{item.itemId?.name || item.name}</span>
                                <span className="text-green-600 font-black">×{item.quantity}</span>
                                <span className="text-gray-400">({formatPrice(item.price)})</span>
                              </div>
                            ))}
                            {order.items.length > 5 && (
                              <div className="inline-flex items-center text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg font-bold">+{order.items.length - 5} more</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status History */}
                      {order.statusHistory?.length > 0 && (
                        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-sm font-bold text-gray-600 mb-3">Order Timeline</p>
                          <div className="space-y-2">
                            {order.statusHistory.slice().reverse().slice(0, 4).map((history, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-xs">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-bold text-gray-700">{history.status}</span>
                                <span className="text-gray-400">{formatDateTime(history.timestamp)}</span>
                                {history.note && <span className="text-gray-500">- {history.note}</span>}
                              </div>
                            ))}
                            {order.statusHistory.length > 4 && <p className="text-xs text-gray-400 ml-5">+{order.statusHistory.length - 4} more updates</p>}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => router.push(`/track-order?orderId=${order.orderId || order._id}&key=track-order&mobile=${profile?.phoneNumber}`)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer">
                          <Truck size={16} /> Track Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
