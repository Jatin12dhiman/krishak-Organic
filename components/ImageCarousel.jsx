"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from "next/image";

const ImageCarousel = ({ images, height = "h-64", objectFit = "object-contain" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleDotClick = (index, e) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    return (
        <div className={`relative group w-full ${height} bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100`}>
            {/* Main Image */}
            <div className="w-full h-full relative">
                <Image
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    fill
                    className={`${objectFit} p-4 transition-transform duration-500`}
                />
            </div>

            {/* Navigation Buttons (only if > 1 image) */}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-2 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-2 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => handleDotClick(index, e)}
                                className={`w-2 h-2 rounded-full transition-all shadow-sm ${currentIndex === index ? 'bg-saffron-600 w-4' : 'bg-neutral-300 hover:bg-neutral-400'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Counter Badge */}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageCarousel;
