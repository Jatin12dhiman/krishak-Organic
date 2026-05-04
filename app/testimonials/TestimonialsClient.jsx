"use client";
import { Star, Quote, MessageSquare } from "lucide-react";
import Image from "next/image";

const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
      ))}
    </div>
  );
}

function TextTestimonial({ t }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 flex flex-col">
      <div className="flex items-start gap-1">
        <Quote size={20} className="text-green-200 flex-shrink-0 mt-1" />
        <p className="text-gray-600 leading-relaxed flex-1">{t.review}</p>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-50 mt-auto">
        {t.image ? (
          <Image src={t.image} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-black text-sm">
            {t.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-black text-gray-800 text-sm">{t.name}</p>
          {t.designation && <p className="text-xs text-gray-400">{t.designation}</p>}
          <StarRating rating={t.rating} />
        </div>
      </div>
    </div>
  );
}

function YoutubeTestimonial({ t }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("embed")) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const embedUrl = getEmbedUrl(t.youtubeUrl);
  if (!embedUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative w-full aspect-video">
        <iframe src={embedUrl} title={t.name} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <YoutubeIcon size={16} className="text-red-500" />
        </div>
        <div>
          <p className="font-black text-gray-800 text-sm">{t.name}</p>
          {t.designation && <p className="text-xs text-gray-400">{t.designation}</p>}
        </div>
        <StarRating rating={t.rating} />
      </div>
    </div>
  );
}

function InstagramTestimonial({ t }) {
  if (!t.instagramUrl) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-gray-50">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
          <InstagramIcon size={16} className="text-white" />
        </div>
        <div>
          <p className="font-black text-gray-800 text-sm">{t.name}</p>
          {t.designation && <p className="text-xs text-gray-400">{t.designation}</p>}
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm italic">{t.review}</p>
        <a href={t.instagramUrl} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors">
          <InstagramIcon size={16} /> View on Instagram
        </a>
      </div>
    </div>
  );
}

export default function TestimonialsClient({ testimonials }) {
  const textTestimonials = testimonials.filter(t => !t.type || t.type === "text");
  const youtubeTestimonials = testimonials.filter(t => t.type === "youtube");
  const instagramTestimonials = testimonials.filter(t => t.type === "instagram");

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-20 px-4 text-center">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
          <MessageSquare size={28} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">What Our Customers Say</h1>
        <p className="mt-3 text-white/80 text-lg">Real reviews from real people who love Krishak Organic.</p>
        {testimonials.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-5xl font-black">{avgRating}</span>
            <div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} className={i <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-white/30"} />)}
              </div>
              <p className="text-white/70 text-sm mt-1">{testimonials.length} reviews</p>
            </div>
          </div>
        )}
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        {testimonials.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No testimonials yet. Be the first to share your experience!</p>
          </div>
        )}

        {/* Text Reviews */}
        {textTestimonials.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {textTestimonials.map(t => <TextTestimonial key={t._id} t={t} />)}
            </div>
          </section>
        )}

        {/* YouTube Videos */}
        {youtubeTestimonials.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <YoutubeIcon size={20} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Video Reviews</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {youtubeTestimonials.map(t => <YoutubeTestimonial key={t._id} t={t} />)}
            </div>
          </section>
        )}

        {/* Instagram Posts */}
        {instagramTestimonials.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                <InstagramIcon size={20} className="text-pink-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Instagram Stories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instagramTestimonials.map(t => <InstagramTestimonial key={t._id} t={t} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
