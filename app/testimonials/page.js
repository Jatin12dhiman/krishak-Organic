import { api } from "@/lib/api";
import TestimonialsClient from "./TestimonialsClient";

export const metadata = {
  title: "Customer Reviews | Krishak Organic",
  description: "See what our customers are saying about Krishak Organic. Read reviews, watch video testimonials and Instagram stories.",
};

export const revalidate = 3600;

async function getTestimonials() {
  try {
    const res = await api.get("/testimonials", { params: { isActive: "true" } });
    return res.data?.testimonials || res.data || [];
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return <TestimonialsClient testimonials={testimonials} />;
}
