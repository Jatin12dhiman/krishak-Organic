"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Leaf, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CategorySlider({ title = "Categories", subtitle, initialData }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/categories?limit=100");
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.categories || data?.items || [];
        if (active) setCategories(list);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  const handleCategoryClick = (categoryId) => {
    router.push(`/menu?category=${categoryId}`);
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full mb-4">
            <Leaf size={18} />
            <span className="text-sm font-semibold">Shop by Category</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Browse Categories
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            Explore our wide range of fresh organic products
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-500">Error loading categories: {error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full">
            <Leaf size={18} />
            <span className="text-sm font-semibold">Shop by Category</span>
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
        {subtitle ? (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        ) : (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            Explore our wide range of fresh organic products
          </p>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.length > 0 ? categories.map((cat, index) => (
          <motion.button
            key={cat._id}
            onClick={() => handleCategoryClick(cat._id)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
              )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
              <span className="font-bold text-sm sm:text-base md:text-lg text-center text-white drop-shadow-lg">
                {cat.name}
              </span>

              {/* Arrow Icon on Hover */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <ArrowRight className="text-white" size={18} />
                </div>
              </motion.div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
          </motion.button>
        )) : (
          <div className="col-span-full py-10 text-center text-neutral-500">
            No categories found. Please add categories in the admin panel.
          </div>
        )}
      </div>
    </section>
  );
}

