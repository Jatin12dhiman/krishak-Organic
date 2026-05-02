"use client";
import ToastProvider from "@/components/ui/ToastProvider.jsx";
import AuthProvider from "@/app/AuthProvider.jsx";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}


