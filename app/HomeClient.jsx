"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import HeroCarousel from "@/components/HeroCarousel";

import CategorySlider from "@/components/CategorySlider";
import OffersSection from "@/components/OffersSection";
import FeaturedItems from "@/components/FeaturedItems";
import NewArrivals from "@/components/NewArrivals";
import TestimonialsSection from "@/components/TestimonialsSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
    Sparkles,
    Gift,
    Heart,
    Package,
    Truck,
    Shield,
    Award,
    Users,
    ArrowRight,
    Box,
    Palette,
    Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function HomeClient({
    initialData = {}
}) {
    const router = useRouter();
    const [sectionTitles, setSectionTitles] = useState(initialData.systemConfig?.sectionTitles || {
        featuredItems: { title: "Featured Items", subtitle: "" },
        offers: { title: "Offers", subtitle: "" },
        newArrivals: { title: "New Arrivals", subtitle: "" },
        categories: { title: "Categories", subtitle: "" },
        testimonials: { title: "Testimonials", subtitle: "" },
    });

    useEffect(() => {
        if (initialData.systemConfig) return;
        let active = true;
        (async () => {
            try {
                const { api } = await import("@/lib/api");
                const res = await api.get("/system-config");
                const data = res?.data ?? res;
                if (active && data?.sectionTitles) {
                    setSectionTitles(data.sectionTitles);
                }
            } catch (e) {
                console.error("Failed to load section titles:", e);
            }
        })();
        return () => {
            active = false;
        };
    }, [initialData.systemConfig]);

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
            },
        },
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* More visible decorative blobs - static */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                {/* Top right - green blob */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-linear-to-br from-green-200/40 via-green-300/30 to-yellow-200/20 rounded-full blur-3xl"></div>

                {/* Top left - teal blob */}
                <div className="absolute top-40 -left-20 w-80 h-80 bg-linear-to-bl from-green-100/35 via-teal-200/25 to-cream-100/20 rounded-full blur-3xl"></div>

                {/* Middle right - Gold blob */}
                <div className="absolute top-1/2 -right-32 w-72 h-72 bg-linear-to-l from-yellow-200/35 via-green-200/25 to-transparent rounded-full blur-3xl"></div>

                {/* Bottom left - Warm blob */}
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-linear-to-tr from-green-200/35 via-yellow-100/25 to-cream-100/15 rounded-full blur-3xl"></div>

                {/* Bottom right - Accent blob */}
                <div className="absolute bottom-20 -right-20 w-64 h-64 bg-linear-to-tl from-green-300/30 to-transparent rounded-full blur-2xl"></div>

                {/* Center floating blob */}
                <div className="absolute top-1/3 left-1/3 w-56 h-56 bg-linear-to-br from-yellow-100/20 via-green-100/15 to-transparent rounded-full blur-3xl"></div>
            </div>

            {/* Hero Section with Interactive Banner */}
            <section className="relative">
                <HeroCarousel initialImages={initialData.systemConfig?.heroImages} />
            </section>

            {/* Category Slider */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-categories"
            >
                <CategorySlider
                    initialData={initialData.categories}
                    title={typeof sectionTitles.categories === 'string' ? sectionTitles.categories : sectionTitles.categories?.title || 'Categories'}
                    subtitle={typeof sectionTitles.categories === 'object' ? sectionTitles.categories?.subtitle : undefined}
                />
            </motion.section>



            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-products"
            >
                <FeaturedItems
                    initialData={initialData.featuredItems}
                    title={typeof sectionTitles.featuredItems === 'string' ? sectionTitles.featuredItems : sectionTitles.featuredItems?.title || 'Featured Items'}
                    subtitle={typeof sectionTitles.featuredItems === 'object' ? sectionTitles.featuredItems?.subtitle : undefined}
                />
            </motion.section>

            {/* New Arrivals */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-products"
            >
                <NewArrivals
                    initialData={initialData.newArrivals}
                    title={typeof sectionTitles.newArrivals === 'string' ? sectionTitles.newArrivals : sectionTitles.newArrivals?.title || 'New Arrivals'}
                    subtitle={typeof sectionTitles.newArrivals === 'object' ? sectionTitles.newArrivals?.subtitle : undefined}
                />
            </motion.section>

            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-benefits relative py-20"
            >
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-saffron-200/20 rounded-full blur-3xl"></div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-block"
                        >
                            <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full mb-6 shadow-xl">
                                <Sparkles size={20} className="animate-pulse" />
                                <span className="text-base font-bold">Our Promise to You</span>
                            </div>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6"
                        >
                            Why Choose <span className="bg-linear-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Krishak Organic?</span>
                        </motion.h2>
                        <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl mx-auto font-medium">
                            Experience the perfect blend of tradition & quality ✨
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                        {[
                            {
                                icon: Gift,
                                title: "100% Customizable",
                                description:
                                    "Choose your favorite snacks & create the perfect mix for your celebration",
                                gradient: "from-green-400 via-green-500 to-red-500",
                                bgGradient: "from-green-50 to-red-50",
                                iconBg: "from-green-400 to-red-500",
                            },
                            {
                                icon: Shield,
                                title: "Premium Quality",
                                description:
                                    "Fresh, authentic Indian snacks made with the finest ingredients",
                                gradient: "from-yellow-400 via-green-400 to-green-500",
                                bgGradient: "from-yellow-50 to-green-50",
                                iconBg: "from-yellow-400 to-green-500",
                            },
                            {
                                icon: Truck,
                                title: "Fast Delivery",
                                description:
                                    "Quick & reliable delivery across India to make your events memorable",
                                gradient: "from-green-500 via-green-600 to-emerald-600",
                                bgGradient: "from-green-50 to-emerald-50",
                                iconBg: "from-green-500 to-emerald-600",
                            },
                        ].map((benefit, index) => {
                            const IconComponent = benefit.icon;
                            return (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.15 }}
                                    whileHover={{ y: -12, scale: 1.03 }}
                                    className="relative group"
                                >
                                    {/* Glowing background on hover */}
                                    <div className={`absolute inset-0 bg-linear-to-br ${benefit.gradient} rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl`}></div>

                                    {/* Card */}
                                    <div className={`relative bg-linear-to-br ${benefit.bgGradient} rounded-3xl p-8 md:p-10 text-center border-2 border-green-200/50 group-hover:border-green-400 transition-all duration-300 shadow-xl group-hover:shadow-2xl overflow-hidden`}>
                                        {/* Decorative corner elements */}
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-green-300/20 to-transparent rounded-bl-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-green-300/20 to-transparent rounded-tr-3xl"></div>

                                        {/* Icon */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                                            className="relative"
                                        >
                                            <div className={`inline-flex items-center justify-center w-24 h-24 bg-linear-to-br ${benefit.iconBg} rounded-2xl mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                                <IconComponent className="text-white" size={44} />
                                            </div>
                                        </motion.div>

                                        {/* Content */}
                                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4 group-hover:text-green-600 transition-colors">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-neutral-700 leading-relaxed text-base md:text-lg font-medium">
                                            {benefit.description}
                                        </p>

                                        {/* Decorative bottom bar */}
                                        <div className={`mt-6 h-1 w-20 mx-auto bg-linear-to-r ${benefit.gradient} rounded-full group-hover:w-32 transition-all duration-300`}></div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>



            {/* Offers Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-offers"
            >
                <OffersSection
                    initialData={initialData.offers}
                    title={typeof sectionTitles.offers === 'string' ? sectionTitles.offers : sectionTitles.offers?.title || 'Offers'}
                    subtitle={typeof sectionTitles.offers === 'object' ? sectionTitles.offers?.subtitle : undefined}
                />
            </motion.section>


            {/* Testimonials */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-section-testimonials"
            >
                <TestimonialsSection
                    initialData={initialData.testimonials}
                    title={typeof sectionTitles.testimonials === 'string' ? sectionTitles.testimonials : sectionTitles.testimonials?.title || 'Testimonials'}
                    subtitle={typeof sectionTitles.testimonials === 'object' ? sectionTitles.testimonials?.subtitle : undefined}
                />
            </motion.section>

            {/* Final CTA Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32"
            >
                <div className="relative overflow-hidden rounded-[2.5rem] bg-section-cta p-12 md:p-16 lg:p-24 text-center shadow-2xl border-4 border-saffron-400/30">
                    {/* Animated Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 20px 20px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    {/* Decorative Blobs - Static for better performance */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gold-300/30 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="inline-block mb-8"
                            >
                                <Sparkles className="text-white drop-shadow-lg" size={56} />
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                                Ready to Experience<br className="hidden sm:block" /> Organic Goodness?
                            </h2>
                            <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                                Shop our collection of fresh, organic products today and make your
                                lifestyle healthier with authentic natural flavors.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={() => router.push("/products")}
                                        className="cursor-pointer bg-white text-saffron-600 hover:bg-cream-50 px-10 py-5 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 group border-4 border-white/20"
                                    >
                                        <Box size={26} />
                                        Shop Now
                                        <ArrowRight
                                            size={24}
                                            className="transition-transform group-hover:translate-x-2"
                                        />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={() => router.push("/contact-us")}
                                        variant="outline"
                                        className="cursor-pointer border-3 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-10 py-5 text-xl font-bold rounded-full transition-all duration-300 shadow-xl"
                                    >
                                        Contact Us
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* WhatsApp Button */}
            <WhatsAppButton phoneNumber={initialData.systemConfig?.whatsappNumber} />
        </div>
    );
}
