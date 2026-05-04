"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

export default function TestimonialsSection({ title = "Testimonials", subtitle, initialData }) {
  const [testimonials, setTestimonials] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/testimonials", { params: { isActive: "true" } });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.testimonials || [];
        if (active) setTestimonials(list);
      } catch (e) {
        if (active) console.error("Failed to load testimonials:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  if (isLoading) {
    return (
      <section className="md:container md:mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-gold rounded-3xl p-8 md:p-12">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mb-4"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 flex items-center justify-center gap-x-2">
              <Quote className="text-green-600" size={24} />
              {title}
            </h2>
          </motion.div>
          {subtitle ? (
            <p className="text-neutral-600 text-lg">
              {subtitle}
            </p>
          ) : (
            <p className="text-neutral-600 text-lg">
              What our customers are saying
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="glass rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              {currentTestimonial.image ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-700">
                    {currentTestimonial.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{currentTestimonial.name}</h3>
                {currentTestimonial.designation && (
                  <p className="text-sm text-neutral-600">{currentTestimonial.designation}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  className={star <= currentTestimonial.rating ? "star-shimmer" : ""}
                >
                  <Star
                    size={20}
                    className={
                      star <= currentTestimonial.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-lg text-neutral-700 leading-relaxed italic">
              "{currentTestimonial.review}"
            </p>
          </motion.div>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:scale-125 ${index === currentIndex
                      ? "bg-green-600 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

