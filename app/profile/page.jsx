"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/app/AuthProvider.jsx";
import { Wallet, Copy, Check, Share2, Package, User, LogOut, Gift } from "lucide-react";
import { toast } from "react-hot-toast";

function formatPrice(p) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p || 0);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralConfig, setReferralConfig] = useState({ referrerWalletReward: 50, refereeDiscountPercent: 10 });

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        const [meRes, configRes] = await Promise.all([
          api.get("/users/me").catch(() => null),
          api.get("/system-config").catch(() => null),
        ]);
        if (meRes?.data) setProfile(meRes.data);
        if (configRes?.data?.referral) setReferralConfig(configRes.data.referral);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [authUser]);

  const referralLink = typeof window !== "undefined" && profile?.referralCode
    ? `${window.location.origin}/signup?referralCode=${profile.referralCode}`
    : "";

  const handleCopyCode = async () => {
    if (!profile?.referralCode) return;
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy code");
    }
  };

  const handleShare = async () => {
    const message = `Hey! 👋 Sign up on Krishak Organic using my referral code and get ${referralConfig.refereeDiscountPercent}% off your first order!\n\nCode: ${profile?.referralCode}\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Krishak Organic", text: message, url: referralLink });
      } catch { }
    } else {
      await navigator.clipboard.writeText(message);
      toast.success("Invite message copied!");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Could not load profile.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-black text-gray-900">My Profile</h1>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
            {profile.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-xl truncate">{profile.name}</p>
            <p className="text-gray-500 text-sm truncate">{profile.email}</p>
            {profile.phoneNumber && <p className="text-gray-500 text-sm">{profile.phoneNumber}</p>}
          </div>
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Package size={16} /> Orders
          </button>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={20} />
                <p className="font-bold text-blue-100 text-sm">Wallet Balance</p>
              </div>
              <p className="text-4xl font-black">{formatPrice(profile.walletBalance || 0)}</p>
              <p className="text-blue-200 text-xs mt-2">Usable at checkout on your next order</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Wallet size={32} className="text-white" />
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Gift size={22} className="text-emerald-600" />
            <h2 className="font-black text-gray-800 text-lg">Your Referral Code</h2>
          </div>

          <p className="text-sm text-gray-500">
            Share your code with friends. They get{" "}
            <span className="font-black text-green-600">{referralConfig.refereeDiscountPercent}% off</span> their first order,
            and you earn{" "}
            <span className="font-black text-blue-600">{formatPrice(referralConfig.referrerWalletReward)}</span> in your wallet!
          </p>

          {/* Code box */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-5 py-4 text-center">
              <p className="text-2xl font-black text-emerald-700 tracking-widest font-mono">
                {profile.referralCode || "—"}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all shrink-0"
              title="Copy code"
            >
              {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Share2 size={18} />
            Invite Friends & Earn
          </button>

          <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800 font-medium text-center">
            💡 Your code is permanent — share it anytime and keep earning!
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </main>
  );
}
