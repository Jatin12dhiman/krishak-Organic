"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, X, Leaf } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import { useAuth } from "@/app/AuthProvider.jsx";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";

function WelcomeModal({ isOpen, onClose, isNewUser, isCodeSent, reason }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-4">
          {isCodeSent ? (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome Back! 🌿
              </h2>
              <p className="text-neutral-600">
                A special welcome code has been sent to your{" "}
                <span className="font-semibold">SMS and email</span>.
              </p>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800 font-semibold">
                  Use the code to get 10% off your first organic order!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome Back! 👋
              </h2>
              <p className="text-neutral-600">
                We're glad to see you again at Krishak Organic.
              </p>
              {reason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <span className="font-semibold">Reason:</span> {reason}
                  </p>
                </div>
              )}
            </>
          )}

          <Button onClick={onClose} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const fromCheckout = from === "checkout";
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({
    isOpen: false,
    isNewUser: false,
    isCodeSent: false,
    reason: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await login({
        params: from,
        email: data.email,
        password: data.password,
      });
      if (result.success) {
        if (fromCheckout) {
          setModalData({
            isOpen: true,
            isNewUser: result.data.isNewUser || false,
            isCodeSent: result.data.isCodeSent || false,
            reason: result.data.reason || null,
          });
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalData({ ...modalData, isOpen: false });
    router.push("/");
  };

  return (
    <>
      <div className="min-h-screen bg-emerald-50 flex">
        <div className="hidden md:flex flex-1 relative rounded-r-2xl overflow-hidden">
          <Image
            src="/kr1.jpg"
            alt="Organic farming and fresh vegetables"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Form Section - Full width on mobile, half on desktop */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome Back!
              </h1>
              <p className="text-neutral-600 text-lg">
                Sign in to your Krishak account to continue shopping
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="text-emerald-600" size={20} />
                  <label className="block text-sm font-medium text-neutral-700">
                    Email Address
                  </label>
                </div>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="your@email.com"
                  className="w-full focus:ring-emerald-500"
                  error={errors.email?.message}
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Lock className="text-emerald-600" size={20} />
                  <label className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                </div>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className="w-full focus:ring-emerald-500"
                    error={errors.password?.message}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-emerald-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  className="text-emerald-600 hover:underline font-medium"
                  onClick={() =>
                    toast.info("Please contact support to reset your password")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-center text-sm text-neutral-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push(`/signup?from=${from}`)}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>

            {/* Continue shopping button */}
            <div className="text-center">
              <Button
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push("/")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={modalData.isOpen}
        onClose={handleModalClose}
        isNewUser={modalData.isNewUser}
        isCodeSent={modalData.isCodeSent}
        reason={modalData.reason}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
