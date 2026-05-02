"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getMe } from "@/lib/auth";
import Skeleton from "@/components/ui/Skeleton.jsx";
import { Star, ShoppingCart, Sparkles, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Button from "@/components/ui/Button.jsx";

export default function FeaturedItems({ title = "Featured Items", subtitle, initialData }) {
  const router = useRouter();
  const [items, setItems] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [addingToCart, setAddingToCart] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/items", {
          params: {
            isFeatured: "true",
            isActive: "true",
            limit: 8,
            page: 1
          },
        });
        const data = res?.data ?? res;
        const list = Array.isArray(data) ? data : data?.items || [];
        console.log(list);
        if (active) setItems(list);
      } catch (e) {
        if (active) console.error("Failed to load featured items:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  const updateItemQuantity = (itemId, delta) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newQuantity = Math.max(1, current + delta);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleQuantityInputChange = (itemId, value) => {
    // Allow empty string while typing
    if (value === "") {
      setItemQuantities((prev) => ({ ...prev, [itemId]: "" }));
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setItemQuantities((prev) => ({ ...prev, [itemId]: numValue }));
    }
  };

  const handleQuantityBlur = (itemId) => {
    const currentValue = itemQuantities[itemId];
    if (currentValue === "" || currentValue < 1 || isNaN(currentValue)) {
      setItemQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    }
  };

  const getItemQuantity = (itemId) => {
    const value = itemQuantities[itemId];
    // Return empty string if user is typing, otherwise default to 1
    return value === "" ? "" : (value || 1);
  };

  const handleAddToCart = async (item, quantity) => {
    if (quantity === "" || !quantity || quantity < 1) {
      toast.error("Please select a valid quantity");
      return;
    }
    setAddingToCart((prev) => ({ ...prev, [item._id]: true }));
    try {
      let user = null;
      try {
        const userRes = await getMe();
        if (userRes.success && userRes.data) {
          user = userRes.data;
        }
      } catch (e) {

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
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            itemId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: quantity,
            categoryType: item?.category?.name || "",
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
        quantity: quantity,
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
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        ) : (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-saffron-600" />
            Handpicked favorites from our collection
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
          >
            <div className="relative h-64 bg-gray-100 overflow-hidden shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                  <Sparkles className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Buy 1 Get 1 Badge */}
              {item.isBuyOneGetOne && (
                <div className="absolute top-2 left-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10 ">
                  <Tag className="w-3.5 h-3.5" />
                  <span>BUY 1 GET 1</span>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-saffron-600 transition-colors">
                {item.name}
              </h3>

              {item.quantity && item.quantityType && (
                <p className="text-sm text-gray-500 mb-2">
                  {item.quantity} {item.quantityType}
                </p>
              )}

              {item.averageRating !== 0 && item.reviewCount !== 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(item.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({item?.reviewCount || 0})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{item.price}
                </span>
                {item.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{item.oldPrice}
                  </span>
                )}
              </div>

              {/* Quantity Selector & Add to Cart - Pushed to bottom */}
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-3 mb-4 bg-neutral-50 rounded-xl py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateItemQuantity(item._id, -1);
                    }}
                    disabled={getItemQuantity(item._id) <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-saffron-500"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={getItemQuantity(item._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleQuantityInputChange(item._id, e.target.value);
                    }}
                    onBlur={() => handleQuantityBlur(item._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 text-center font-bold text-lg bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateItemQuantity(item._id, 1);
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 transition-colors flex items-center justify-center font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item, getItemQuantity(item._id));
                  }}
                  disabled={addingToCart[item._id]}
                  className="w-full bg-saffron-600 hover:bg-saffron-700 text-white py-2 transition-all duration-300 cursor-pointer"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart[item._id] ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}