import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { api } from "@/lib/api";
import Providers from "./Providers.jsx";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { getSystemConfig, getCategories } from "@/lib/cached-api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Krishak Organic - Fresh & Natural Products Online",
    template: "%s | Krishak Organic"
  },
  description: "Shop fresh, natural and organic products at Krishak Organic. Farm-fresh vegetables, fruits, pulses, and more. Delivered to your doorstep across India.",
  keywords: [
    "organic products",
    "fresh vegetables",
    "natural food",
    "organic delivery",
    "farm fresh",
    "organic fruits",
    "organic groceries",
    "healthy food online",
    "natural produce",
    "krishak organic"
  ],
  authors: [{ name: "Krishak Organic" }],
  creator: "Krishak Organic",
  publisher: "Krishak Organic",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Krishak Organic",
    title: "Krishak Organic - Fresh & Natural Products Online",
    description: "Shop fresh, natural and organic products at Krishak Organic. Farm-fresh vegetables, fruits, pulses, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krishak Organic - Fresh & Natural Products Online",
    description: "Shop fresh, natural and organic products at Krishak Organic.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

async function getLayoutData() {
  try {
    const [systemConfig, categories] = await Promise.all([
      getSystemConfig(),
      getCategories(100),
    ]);

    return {
      systemConfig,
      categories,
    };
  } catch (error) {
    console.error("Error fetching layout data:", error);
    return {};
  }
}

export default async function RootLayout({ children }) {
  const layoutData = await getLayoutData();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header
            initialCategories={layoutData.categories}
            initialConfig={layoutData.systemConfig}
          />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
