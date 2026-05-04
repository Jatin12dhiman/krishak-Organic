"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, X, Leaf } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations";
import { handlePhoneInput, handlePhoneKeyPress } from "@/lib/phoneInput";
import { login } from "@/lib/auth";

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
                Welcome! 🌿
              </h2>
              <p className="text-neutral-600">
                Thanks for signing up! A special welcome code has been sent to your{" "}
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
                Welcome! 👋
              </h2>
              <p className="text-neutral-600">
                Thanks for joining Krishak Organic! We're excited to have you.
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referralCode");
  const from = searchParams.get("from");
  const fromCheckout = from === "checkout";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await api.post("/api/users", {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
        referralCode: referralCode || null,
      });

      if (res.success) {
        toast.success("Account created successfully! Signing you in...");
        const result = await login({
          params: from,
          email: data.email,
          password: data.password,
        });
        if (result.success) {
          if (fromCheckout) {
            setModalData({
              isOpen: true,
              isNewUser: result.isNewUser || false,
              isCodeSent: result.isCodeSent || false,
              reason: result.reason || null,
            });
          } else {
            router.push("/");
          }
        }
      } else {
        throw new Error(res.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
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
        <div className="hidden md:flex flex-1 relative ">
          <Image
            src="https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&auto=format&fit=crop&q=60"
            alt="Organic farming green fields"
            fill
            className="object-cover rounded-r-3xl"
            priority
          />
        </div>

        {/* Form Section - Full width on mobile, half on desktop */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Create Account
              </h1>
              <p className="text-neutral-600 text-lg">
                Sign up to start your organic journey with Krishak
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="text-emerald-600" size={20} />
                  <label className="block text-sm font-medium text-neutral-700">
                    Full Name
                  </label>
                </div>
                <Input
                  type="text"
                  {...register("name")}
                  placeholder="John Doe"
                  className="w-full focus:ring-emerald-500"
                  error={errors.name?.message}
                  disabled={loading}
                />
              </div>

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

              {/* Phone Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Phone className="text-emerald-600" size={20} />
                  <label className="block text-sm font-medium text-neutral-700">
                    Phone Number
                  </label>
                </div>
                <Input
                  type="tel"
                  {...register("phone")}
                  placeholder="9876543210"
                  className="w-full focus:ring-emerald-500"
                  error={errors.phone?.message}
                  disabled={loading}
                  onInput={handlePhoneInput}
                  onKeyPress={handlePhoneKeyPress}
                  inputMode="numeric"
                  pattern="[0-9+\s-]*"
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Lock className="text-emerald-600" size={20} />
                  <label className="block text-sm font-medium text-neutral-700">
                    Confirm Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirm your password"
                    className="w-full focus:ring-emerald-500"
                    error={errors.confirmPassword?.message}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-emerald-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-center text-sm text-neutral-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Sign in here
                </button>
              </p>
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-50 flex">
          <div className="hidden md:flex flex-1 relative">
            <Skeleton className="w-full h-full rounded-r-3xl" />
          </div>
          <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center">
                <Skeleton className="h-10 w-48 mx-auto mb-3" />
                <Skeleton className="h-6 w-64 mx-auto" />
              </div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
