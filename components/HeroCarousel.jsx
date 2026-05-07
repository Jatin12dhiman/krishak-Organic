"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import Button from "./ui/Button";
import { ArrowRight, Leaf, ShoppingBag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

const defaultSlides = [
  {
    image: "/kr1.jpg",
    tagline: "🌿 Fresh & Organic Products Delivered to Your Door",
    title: "Live Naturally,",
    description:
      "Shop our collection of fresh organic vegetables, fruits, pulses, and natural products grown with care directly from farms across India.",
  },
  {
    image: "/kr2.jpg",
    tagline: "🌾 Straight from the Farm to Your Table",
    title: "Pure, Natural &",
    description:
      "Experience the real taste of India's finest organic produce — grown without chemicals, harvested with love, delivered fresh.",
  },
  {
    image: "/kr3.jpg",
    tagline: "🥦 100% Certified Organic Goodness",
    title: "Healthy Families,",
    description:
      "Give your family the nutrition they deserve. Our certified organic range covers everything from staple grains to exotic superfoods.",
  },
  {
    image: "/kr4.jpg",
    tagline: "🌻 Supporting Indian Farmers Since Day One",
    title: "Grow Together,",
    description:
      "Every purchase supports local Indian farmers practicing sustainable agriculture. Good for you, good for the farmer, good for the earth.",
  },
];

const defaultContent = defaultSlides[0];

export default function HeroCarousel({ initialImages }) {
  const [images, setImages] = useState(
    initialImages && initialImages.length > 0 ? initialImages : defaultSlides
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!initialImages || initialImages.length === 0) {
      fetchHeroImages();
    }
  }, [initialImages]);

  const fetchHeroImages = async () => {
    try {
      const res = await api.get("/system-config");
      const data = res?.data ?? res;
      if (
        data?.heroImages &&
        Array.isArray(data.heroImages) &&
        data.heroImages.length > 0
      ) {
        setImages(data.heroImages);
      } else {
        setImages(defaultSlides);
      }
    } catch (error) {
      console.error("Failed to load hero images:", error);
      setImages(defaultSlides);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to split title into main part and last word
  const getTitleParts = (title) => {
    const fullTitle = title || defaultContent.title;
    const words = fullTitle.trim().split(/\s+/);
    if (words.length <= 1) {
      return { mainTitle: "", lastWord: fullTitle };
    }
    const lastWord = words[words.length - 1];
    const mainTitle = words.slice(0, -1).join(" ");
    return { mainTitle, lastWord };
  };

  // Get current slide content with field-level fallbacks
  const getCurrentContent = () => {
    const current = images[currentIndex] || {};

    // Per-field fallbacks
    const tagline =
      current.tagline && current.tagline.trim()
        ? current.tagline
        : defaultContent.tagline;
    const description =
      current.description && current.description.trim()
        ? current.description
        : defaultContent.description;
    const image =
      current.image
        ? (getImageUrl(current.image) || current.image)
        : defaultContent.image;

    // Title logic
    const rawTitle =
      current.title && current.title.trim()
        ? current.title
        : defaultContent.title;
    const { mainTitle, lastWord } = getTitleParts(rawTitle);

    return { tagline, mainTitle, lastWord, description, image };
  };

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="w-full h-[55vh] md:h-[65vh] min-h-[380px] md:min-h-[600px] bg-emerald-50 animate-pulse" />
    );
  }

  if (images.length === 0) return null;

  const content = getCurrentContent();

  return (
    <section className="relative h-[55vh] md:h-[65vh] min-h-[380px] md:min-h-[600px]">
      <div className="absolute inset-0 overflow-hidden bg-linear-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-200 rounded-full blur-2xl opacity-10"></div>
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full h-full"
            >
              <Image
                src={content.image}
                alt={`Hero image ${currentIndex + 1}`}
                fill
                priority={true}
                className="object-cover brightness-[1.05] contrast-[1.05]"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {images.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`h-3 rounded-full transition-all backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  index === currentIndex
                    ? "bg-emerald-500 w-12 shadow-lg shadow-emerald-500/60"
                    : "bg-white/70 hover:bg-white/90 w-3 border border-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent z-10"></div>
      </div>

      <div className="relative z-20 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
          <div className="w-full md:max-w-3xl">
            {/* Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tagline-${currentIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-emerald-700 px-3 py-1.5 md:px-6 md:py-3 rounded-xl md:rounded-full mb-6 md:mb-8 shadow-2xl border-2 border-emerald-200 max-w-full"
              >
                <Sparkles size={16} className="animate-pulse md:w-5 md:h-5" />
                <span className="text-[10px] sm:text-xs md:text-base font-bold leading-tight">
                  {content.tagline}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${currentIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl"
              >
                {content.mainTitle}
                <span className="md:block mt-1 md:mt-2 bg-linear-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-none">
                  {" "}
                  {content.lastWord}
                </span>
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`description-${currentIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-base md:text-2xl text-white/95 mb-8 md:mb-10 leading-relaxed drop-shadow-lg max-w-2xl"
              >
                {content.description}
              </motion.p>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
              <Button
                onClick={() => router.push("/products")}
                className="w-full sm:w-auto cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 md:px-10 md:py-5 text-lg md:text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-3 group border-4 border-emerald-400/30"
              >
                <Leaf size={20} className="md:w-6 md:h-6" />
                Shop Organic Now
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-2 md:w-6 md:h-6"
                />
              </Button>
              <Button
                onClick={() => router.push("/menu")}
                variant="outline"
                className="w-full sm:w-auto cursor-pointer border-3 border-white bg-white/20 backdrop-blur-md text-white hover:bg-white/30 px-6 py-3.5 md:px-10 md:py-5 text-lg md:text-xl font-bold rounded-full transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} className="md:w-6 md:h-6" />
                Browse All Products
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}