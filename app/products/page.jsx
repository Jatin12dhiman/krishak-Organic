import { Suspense } from "react";
import { getCategories, getItems, getSubCategories } from "@/lib/cached-api";
import { ProductsPageContent } from "./ProductsClient";

export const revalidate = 0;

async function getInitialData() {
  try {
    const [categories, subCategories, items] = await Promise.all([
      getCategories(100),
      getSubCategories(),
      getItems({ limit: 50, isActive: "true" }),
    ]);
    return {
      categories,
      subCategories,
      items: items.filter((item) => !item.isBox),
    };
  } catch {
    return { categories: [], subCategories: [], items: [] };
  }
}

function ProductsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 animate-pulse">
      <div className="h-10 w-64 bg-neutral-200 rounded-lg mb-8" />
      <div className="flex gap-4 mb-10 overflow-hidden">
        {[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-36 h-36 bg-neutral-200 rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="h-80 bg-neutral-200 rounded-2xl" />
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-neutral-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const initialData = await getInitialData();

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsPageContent initialData={initialData} />
    </Suspense>
  );
}
