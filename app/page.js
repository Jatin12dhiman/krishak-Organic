import HomeClient from "./HomeClient";
import { api } from "@/lib/api";
import { getSystemConfig, getCategories } from "@/lib/cached-api";
export const revalidate = 0;

async function getInitialData() {
  try {
    const [
      systemConfig,

      featuredItemsRes,
      newArrivalsRes,
      categories,
      offersRes,
      testimonialsRes
    ] = await Promise.all([
      getSystemConfig(),
      api.get("/items", { params: { isFeatured: "true", isActive: "true", limit: 8, page: 1 } }).catch(() => null),
      api.get("/items", { params: { isNewArrival: "true", isActive: "true", limit: 8, page: 1 } }).catch(() => null),
      getCategories(100),
      api.get("/coupons?isForFirstOrder=false", { params: { status: "active", limit: 10 } }).catch(() => null),
      api.get("/testimonials", { params: { isActive: "true" } }).catch(() => null)
    ]);

    const extractData = (res) => res?.data ?? res;

    const extractArray = (data, key1, key2) => {
      if (Array.isArray(data)) return data;
      if (!data) return [];
      return data[key1] || data[key2] || (Array.isArray(data.items) ? data.items : []);
    };

    const offersData = extractData(offersRes);
    const offersArray = extractArray(offersData, 'coupons', 'items');
    const now = new Date();
    const activeOffers = offersArray.filter(offer => {
      if (!offer.image) return false;
      if (offer.expiredAt && new Date(offer.expiredAt) < now) return false;
      return true;
    });

    return {
      systemConfig,

      featuredItems: extractArray(extractData(featuredItemsRes), 'items'),
      newArrivals: extractArray(extractData(newArrivalsRes), 'items'),
      categories,
      offers: activeOffers,
      testimonials: extractArray(extractData(testimonialsRes), 'testimonials')
    };
  } catch (error) {
    console.error("Error fetching initial data for Home page:", error);
    return {};
  }
}

export default async function Home() {
  const initialData = await getInitialData();
  return <HomeClient initialData={initialData} />;
}
