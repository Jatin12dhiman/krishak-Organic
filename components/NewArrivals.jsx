"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getMe } from "@/lib/auth";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Star, ShoppingCart, Zap, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Button from "@/components/ui/Button.jsx";
import { getImageUrl } from "@/lib/utils";

export default function NewArrivals({ title = "New Arrivals", subtitle, initialData }) {
  const router = useRouter();
  const [items, setItems] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/items", {
          params: { isNewArrival: "true", isActive: "true", limit: 8, page: 1 },
        });
        const data = res?.data ?? res;
        let list = Array.isArray(data) ? data : data?.items || [];
        if (list.length === 0) {
          const fallback = await api.get("/items", {
            params: { isActive: "true", limit: 8, page: 2 },
          });
          const fd = fallback?.data ?? fallback;
          list = Array.isArray(fd) ? fd : fd?.items || [];
        }
        if (active) setItems(list);
      } catch (e) {
        if (active) console.error("Failed to load new arrivals:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  const handleAddToCart = async (item) => {
    setAddingToCart((prev) => ({ ...prev, [item._id]: true }));
    try {
      let user = null;
      try {
        const userRes = await getMe();
        if (userRes.success && userRes.data) {
          user = userRes.data;
        }
      } catch (e) {
        // User not logged in
      }

      if (!user || !user._id) {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
        let items = currentCart.items || [];
        const existingIndex = items.findIndex(
          (cartItem) => cartItem.itemId && cartItem.itemId === item._id
        );

        if (item) {
          items = items.filter(it => {
            if (it.boxId) return false;
            return true;
          });
        }
        if (existingIndex >= 0) {
          items[existingIndex].quantity += 1;
        } else {
          items.push({
            itemId: item._id,
            name: item.name,
            price: item.price,
            categoryType: item?.category?.name || "",
            image: item.image,
            quantity: 1,
            isBuyOneGetOne: item.isBuyOneGetOne || false,
          });
        }

        const subtotal = items.reduce(
          (sum, cartItem) => sum + cartItem.quantity * cartItem.price,
          0
        );

        localStorage.setItem(
          "cart",
          JSON.stringify({
            ...currentCart,
            items,
            subtotal,
            total:
              subtotal +
              (currentCart.designCost || 0) +
              (currentCart.shipping || 0),
          })
        );

        toast.success("Item added to cart!");
        window.dispatchEvent(new CustomEvent("cart"));
        return;
      }

      const payload = {
        itemId: item._id,
        quantity: 1,
        price: item.price,
      };

      const res = await api.post(`/users/${user._id}/add-to-cart`, payload);
      localStorage.setItem("cart", JSON.stringify(res?.data ?? res));
      toast.success("Item added to cart!");
      window.dispatchEvent(new CustomEvent("cart"));
    } catch (err) {
      console.error("Error adding item to cart:", err);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className="md:container md:mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 flex items-center gap-x-2">
            <Zap className="text-saffron-600" size={24} />
            {title}
          </h2>
        </motion.div>
        {subtitle ? (
          <p className="text-neutral-600 text-lg">
            {subtitle}
          </p>
        ) : (
          <p className="text-neutral-600 text-lg">
            Check out our latest additions
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
              ease: [0.4, 0, 0.2, 1],
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group glass rounded-xl overflow-hidden relative"
          >

            {item.isBuyOneGetOne ? (
              <div className="absolute top-2 left-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10 ">
                <Tag className="w-3.5 h-3.5" />
                <span>BUY 1 GET 1</span>
              </div>
            ) : <motion.div
              className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              NEW
            </motion.div>}
            <div className="relative h-48 w-full overflow-hidden">
              {item.image ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </motion.div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200">
                  <ShoppingCart className="text-gray-300" size={48} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2">
                {item.name}
              </h3>
              {item.quantity && item.quantityType && (
                <p className="text-sm text-neutral-600 mb-2">
                  {item.quantity} {item.quantityType}
                </p>
              )}
              <div className="flex items-center gap-2 mb-3">
                {item.averageRating !== 0 && item.reviewCount !== 0 &&
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= (item.averageRating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-600">
                      ({item?.reviewCount || 0})
                    </span>
                  </>
                }
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-saffron-600">
                    ₹{item.price}
                  </span>
                  {item.oldPrice && (
                    <span className="text-sm text-neutral-400 line-through ml-2">
                      ₹{item.oldPrice}
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleAddToCart(item)}
                  disabled={addingToCart[item._id]}
                  className="w-full bg-saffron-600 hover:bg-saffron-700 text-white py-2 transition-all duration-300 cursor-pointer"
                  aria-label={`Add ${item.name} to cart`}
                >
                  {addingToCart[item._id] ? "Adding..." : "Add to Cart"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
