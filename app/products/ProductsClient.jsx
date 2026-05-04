"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button.jsx";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Search, Filter, ShoppingCart, Package, Star, X, Tag, Sparkles } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function ProductsPageContent({ initialData = {} }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState(initialData.items || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [categories, setCategories] = useState(initialData.categories || []);
  const [subCategories, setSubCategories] = useState(initialData.subCategories || []);
  const [itemQuantities, setItemQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const { user } = useAuth();
  const isInitialMount = useRef(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        isActive: "true",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedSubCategory !== "all" && { subCategory: selectedSubCategory }),
      };
      const res = await api.get("/items", { params });
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : data?.items || [];
      const filtered = list.filter(
        (item) => item.price >= priceRange.min && item.price <= priceRange.max && !item.isBox
      );
      setItems(filtered);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubCategory, priceRange]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories?limit=100");
      const data = res?.data ?? res;
      setCategories(data?.categories || data || []);
    } catch {}
  }, []);

  const fetchSubCategories = useCallback(async () => {
    try {
      const res = await api.get("/subcategories");
      const data = res?.data ?? res;
      setSubCategories(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => {
    if (isInitialMount.current && initialData.items?.length > 0) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!initialData.categories?.length) fetchCategories();
    if (!initialData.subCategories?.length) fetchSubCategories();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam && categories.length > 0) {
      const found = categories.find(
        (cat) => cat._id === categoryParam || cat.name?.toLowerCase() === categoryParam.toLowerCase()
      );
      if (found) {
        setSelectedCategory(found._id);
        setSelectedSubCategory("all");
      }
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const searchParam = searchParams?.get("search");
    if (searchParam) setSearchQuery(decodeURIComponent(searchParam));
    else setSearchQuery("");
  }, [searchParams]);

  const updateItemQuantity = (itemId, delta) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1;
      return { ...prev, [itemId]: Math.max(1, current + delta) };
    });
  };

  const handleQuantityInputChange = (itemId, value) => {
    if (value === "") {
      setItemQuantities((prev) => ({ ...prev, [itemId]: "" }));
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) setItemQuantities((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleQuantityBlur = (itemId) => {
    const val = itemQuantities[itemId];
    if (val === "" || val < 1 || isNaN(val)) setItemQuantities((prev) => ({ ...prev, [itemId]: 1 }));
  };

  const getItemQuantity = (itemId) => {
    const val = itemQuantities[itemId];
    return val === "" ? "" : val || 1;
  };

  const handleAddToCart = async (item, quantity) => {
    if (!quantity || quantity < 1) {
      toast.error("Please select a valid quantity");
      return;
    }
    setAddingToCart((prev) => ({ ...prev, [item._id]: true }));
    try {
      const userId = user?._id;
      const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
      let cartItems = currentCart.items || [];

      cartItems = cartItems.filter((it) => !it.boxId);
      const existingIndex = cartItems.findIndex((it) => (it.itemId?._id || it.itemId) === item._id);

      if (!userId) {
        if (existingIndex >= 0) {
          cartItems[existingIndex].quantity += quantity;
        } else {
          cartItems.push({
            itemId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity,
            categoryType: item?.category?.name || "",
            isBuyOneGetOne: item.isBuyOneGetOne || false,
          });
        }
        const subtotal = cartItems.reduce((s, it) => s + it.quantity * it.price, 0);
        localStorage.setItem("cart", JSON.stringify({ ...currentCart, items: cartItems, subtotal, total: subtotal + (currentCart.designCost || 0) + (currentCart.shipping || 0) }));
        toast.success("Item added to cart!");
        setItemQuantities((prev) => ({ ...prev, [item._id]: 1 }));
        window.dispatchEvent(new CustomEvent("cart"));
        return;
      }

      const res = await api.post(`/users/${userId}/add-to-cart`, { itemId: item._id, quantity, price: item.price });
      localStorage.setItem("cart", JSON.stringify(res?.data ?? res));
      toast.success("Item added to cart!");
      setItemQuantities((prev) => ({ ...prev, [item._id]: 1 }));
      window.dispatchEvent(new CustomEvent("cart"));
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const filteredSubCategories = useMemo(() => {
    if (selectedCategory === "all") return subCategories;
    return subCategories.filter((sub) => sub.category === selectedCategory);
  }, [subCategories, selectedCategory]);

  const hasActiveFilters = selectedCategory !== "all" || selectedSubCategory !== "all" || searchQuery || priceRange.min > 0 || priceRange.max < 10000;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Browse Products</h1>

      {/* Categories */}
      <div className="mb-10">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-bold text-neutral-900 mb-6 px-2"
        >
          Categories
        </motion.h2>
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide py-6 -mx-2 px-6 overflow-y-visible">
            <motion.div
              className="flex gap-4 min-w-max items-start"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.button
                onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); router.push("/products"); }}
                variants={{ hidden: { opacity: 0, scale: 0.8, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
                whileHover={{ scale: 1.05, y: -4, zIndex: 30 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative shrink-0 w-36 sm:w-44 h-36 sm:h-44 rounded-[2rem] overflow-hidden z-10 ${selectedCategory === "all" ? "ring-4 ring-green-500 ring-offset-4 ring-offset-white shadow-2xl z-20" : "shadow-lg"}`}
                style={{ willChange: "transform" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600"
                  animate={{ opacity: selectedCategory === "all" ? 1 : 0.85 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10" whileHover={{ scale: 1.05 }}>
                  <motion.div animate={{ scale: selectedCategory === "all" ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.5, repeat: selectedCategory === "all" ? Infinity : 0, repeatDelay: 2 }}>
                    <Package className="text-white mb-2 drop-shadow-lg" size={36} />
                  </motion.div>
                  <span className="text-white font-bold text-sm sm:text-base text-center drop-shadow-md">All Categories</span>
                </motion.div>
                <AnimatePresence>
                  {selectedCategory === "all" && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center z-20 shadow-xl"
                    >
                      <motion.div className="w-3 h-3 bg-green-600 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {categories.map((cat, index) => (
                <motion.button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat._id); setSelectedSubCategory("all"); router.push(`/products?category=${cat._id}`); }}
                  variants={{ hidden: { opacity: 0, scale: 0.8, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24, delay: index * 0.05 } } }}
                  whileHover={{ scale: 1.05, y: -4, zIndex: 30 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative shrink-0 w-36 sm:w-44 h-36 sm:h-44 rounded-[2rem] overflow-hidden z-10 ${selectedCategory === cat._id ? "ring-4 ring-green-500 ring-offset-4 ring-offset-white shadow-2xl z-20" : "shadow-lg"}`}
                  style={{ willChange: "transform" }}
                >
                  {cat.image ? (
                    <motion.img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.4 }} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-green-400 to-green-500" />
                  )}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ backgroundColor: selectedCategory === cat._id ? "rgba(22, 163, 74, 0.35)" : "rgba(0, 0, 0, 0.25)" }}
                    whileHover={{ backgroundColor: selectedCategory === cat._id ? "rgba(22, 163, 74, 0.4)" : "rgba(0, 0, 0, 0.35)" }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10" whileHover={{ scale: 1.05 }}>
                    <motion.span className="font-bold text-sm sm:text-base text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" animate={{ scale: selectedCategory === cat._id ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.5 }}>
                      {cat.name}
                    </motion.span>
                  </motion.div>
                  <AnimatePresence>
                    {selectedCategory === cat._id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center z-20 shadow-xl"
                      >
                        <motion.div className="w-3 h-3 bg-green-600 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sub-categories */}
      {selectedCategory !== "all" && filteredSubCategories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-semibold text-neutral-800">Sub-Categories</h2>
            {selectedSubCategory !== "all" && (
              <button onClick={() => setSelectedSubCategory("all")} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                <X size={14} /> Clear
              </button>
            )}
          </div>
          <div className="overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
            <div className="flex gap-3 min-w-max">
              <button
                onClick={() => setSelectedSubCategory("all")}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedSubCategory === "all" ? "bg-green-600 text-white shadow-lg scale-105" : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-green-400 hover:shadow-md"}`}
              >
                <span className="font-medium text-sm whitespace-nowrap">All</span>
              </button>
              {filteredSubCategories.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => setSelectedSubCategory(sub._id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedSubCategory === sub._id ? "bg-green-600 text-white shadow-lg scale-105" : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-green-400 hover:shadow-md"}`}
                >
                  <span className="font-medium text-sm whitespace-nowrap">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/80 sticky top-20">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-neutral-900">
                <Filter size={22} className="text-green-600" />
                Filters
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2.5 text-neutral-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-neutral-700">Price Range</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="0" max="10000" step="100"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 mb-1">Min</label>
                      <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 mb-1">Max</label>
                      <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-green-500 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-700">Active Filters</span>
                    <button
                      onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); setSearchQuery(""); setPriceRange({ min: 0, max: 10000 }); router.push("/products"); }}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "all" && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">{categories.find((c) => c._id === selectedCategory)?.name || "Category"}</span>
                    )}
                    {selectedSubCategory !== "all" && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">{filteredSubCategories.find((s) => s._id === selectedSubCategory)?.name || "Sub-Category"}</span>
                    )}
                    {searchQuery && <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">&quot;{searchQuery}&quot;</span>}
                    {(priceRange.min > 0 || priceRange.max < 10000) && <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">₹{priceRange.min} – ₹{priceRange.max}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => router.push(`/shop/${item._id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden border border-gray-100"
                >
                  <div className="relative h-44 bg-gray-50 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                        <Sparkles className="w-10 h-10 text-green-300" />
                      </div>
                    )}
                    {item.isBuyOneGetOne && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1 z-10">
                        <Tag className="w-3 h-3" />
                        <span>B1G1</span>
                      </div>
                    )}
                    {item.oldPrice && item.oldPrice > item.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow z-10">
                        {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">{item.name}</h3>
                    {item.quantity && item.quantityType && (
                      <p className="text-xs text-neutral-500 mb-1">{item.quantity} {item.quantityType}</p>
                    )}

                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-base font-bold text-gray-900">₹{item.price}</span>
                      {item.oldPrice && item.oldPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.oldPrice}</span>
                      )}
                    </div>

                    {item.averageRating > 0 && item.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} className={star <= Math.round(item.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        ))}
                        <span className="text-xs text-neutral-500 ml-1">({item.reviewCount})</span>
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center justify-center gap-2 mb-2 bg-neutral-50 rounded-lg py-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateItemQuantity(item._id, -1); }}
                          disabled={getItemQuantity(item._id) <= 1}
                          className="w-7 h-7 rounded-md bg-white border border-neutral-200 hover:border-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-sm focus:outline-none"
                        >
                          −
                        </button>
                        <input
                          type="number" min="1"
                          value={getItemQuantity(item._id)}
                          onChange={(e) => { e.stopPropagation(); handleQuantityInputChange(item._id, e.target.value); }}
                          onBlur={() => handleQuantityBlur(item._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-12 text-center font-bold text-sm bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); updateItemQuantity(item._id, 1); }}
                          className="w-7 h-7 rounded-md bg-white border border-neutral-200 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center font-bold text-sm cursor-pointer focus:outline-none"
                        >
                          +
                        </button>
                      </div>

                      <Button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(item, getItemQuantity(item._id)); }}
                        disabled={addingToCart[item._id]}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm transition-all duration-300 cursor-pointer rounded-lg"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        {addingToCart[item._id] ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
