"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Tag, Copy, Check, Minus } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function OffersSection({ title = "Offers", subtitle, initialData }) {
  const [offers, setOffers] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/coupons?isForFirstOrder=false", {
          params: { status: "active", limit: 10 },
        });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.coupons || data?.items || [];
        const now = new Date();
        const offersWithImages = list.filter((offer) => {
          if (!offer.image) return false;
          if (offer.expiredAt && new Date(offer.expiredAt) < now) return false;
          return true;
        });
        if (active) setOffers(offersWithImages);
      } catch (e) {
        if (active) console.error("Failed to load offers:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <section className="md:container md:mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full">
            <Tag size={18} />
            <span className="text-sm font-semibold">Limited Time Offers</span>
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {!subtitle && (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            Exclusive deals and discounts just for you 🎁
          </p>
        )}
      </div>

      <div className="relative">
        <div className="md:hidden relative">
          <div className="overflow-x-auto scrollbar-hide py-4 -mx-4 px-4">
            <div className="flex gap-6 min-w-max">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group bg-white rounded-2xl overflow-hidden relative shrink-0 w-[320px] shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300"
                >
                  {offer.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-saffron-50 to-gold-50">
                      <Image
                        src={offer.image}
                        alt={offer.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 320px, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {offer.discountOff}% OFF
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-1">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {offer.description}
                      </p>
                    )}
                    {offer.minimumOrderAmount && (
                      <div className="flex items-center gap-1.5 mb-3 text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                        <Minus size={16} className="text-neutral-500" />
                        <span className="font-medium">Min. order:</span>
                        <span className="font-bold text-saffron-700">
                          {formatCurrency(offer.minimumOrderAmount)}
                        </span>
                      </div>
                    )}
                    {offer.code && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-saffron-50 to-gold-50 border-2 border-dashed border-saffron-300 rounded-xl px-4 py-3">
                        <div className="flex-1">
                          <div className="text-xs text-neutral-600 mb-0.5">Coupon Code</div>
                          <span className="font-mono text-base font-bold text-saffron-700">
                            {offer.code}
                          </span>
                        </div>
                        <motion.button
                          onClick={() => handleCopyCode(offer.code)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-saffron-600 text-white rounded-lg hover:bg-saffron-700 transition-colors shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                          title="Copy code"
                          aria-label={`Copy coupon code ${offer.code}`}
                        >
                          {copiedCode === offer.code ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} />
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-white rounded-2xl overflow-hidden relative shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300"
            >
              {offer.image && (
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-saffron-50 to-gold-50">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {offer.discountOff}% OFF
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>
                )}
                {/* Minimum Order Amount */}
                {offer.minimumOrderAmount && (
                  <div className="flex items-center gap-1.5 mb-4 text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                    <Minus size={16} className="text-neutral-500" />
                    <span className="font-medium">Minimum order:</span>
                    <span className="font-bold text-saffron-700">
                      {formatCurrency(offer.minimumOrderAmount)}
                    </span>
                  </div>
                )}
                {offer.code && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-saffron-50 to-gold-50 border-2 border-dashed border-saffron-300 rounded-xl px-4 py-3">
                    <div className="flex-1">
                      <div className="text-xs text-neutral-600 mb-0.5">Coupon Code</div>
                      <span className="font-mono text-base font-bold text-saffron-700">
                        {offer.code}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => handleCopyCode(offer.code)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-saffron-600 text-white rounded-lg hover:bg-saffron-700 transition-colors shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                      title="Copy code"
                      aria-label={`Copy coupon code ${offer.code}`}
                    >
                      {copiedCode === offer.code ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}