"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getMe } from "@/lib/auth";
import Button from "@/components/ui/Button.jsx";
import Skeleton from "@/components/ui/Skeleton.jsx";
import {
  Package,
  ArrowRight,
  Sparkles,
  Tag,
  Star,
  ShoppingCart,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import ViewBoxModal from "./ViewBoxModal";
import ImageCarousel from "./ImageCarousel";

export default function FeaturedBoxes({
  title = "Featured Boxes",
  subtitle,
  initialData,
  initialConfig,
}) {
  const router = useRouter();
  const [boxes, setBoxes] = useState(initialData || []);
  const [isLoading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const [boxQuantities, setBoxQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [minimumBoxOrderQuantity, setMinimumBoxOrderQuantity] = useState(
    initialConfig?.minimumBoxOrderQuantity !== undefined
      ? initialConfig.minimumBoxOrderQuantity
      : 1
  );
  const [selectedBox, setSelectedBox] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/boxes", { params: { limit: 4 } });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.boxes || data?.items || [];
        if (active) setBoxes(list);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialData]);

  useEffect(() => {
    if (initialConfig) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get("/system-config");
        if (res.success && res.data) {
          if (active && res.data.minimumBoxOrderQuantity !== undefined) {
            setMinimumBoxOrderQuantity(res.data.minimumBoxOrderQuantity);
          }
        }
      } catch (error) {
        console.error("Error fetching system config:", error);
        if (active) setMinimumBoxOrderQuantity(1);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialConfig]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleAddToCart = async (box, quantity) => {
    if (quantity === "" || !quantity || quantity < 1) {
      toast.error("Please select a valid quantity");
      return;
    }

    if (quantity < minimumBoxOrderQuantity) {
      toast.error(
        `Minimum order quantity is ${minimumBoxOrderQuantity} box${minimumBoxOrderQuantity !== 1 ? "es" : ""
        }`
      );
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [box._id]: true }));
    try {
      // Check if user is logged in
      let user = null;
      try {
        const userRes = await getMe();
        if (userRes.success && userRes.data) {
          user = userRes.data;
        }
      } catch (e) {
        // User not logged in, will use localStorage
      }

      // For guest users, use localStorage
      if (!user || !user._id) {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
        let items = currentCart.items || [];

        if (box._id) {
          items = items.filter(it => {
            if (it.itemId && it.categoryType?.toLowerCase() === "snacks") return false;
            return true;
          });
        }
        const existingIndex = items.findIndex(
          (item) => item.boxId && item.boxId === box._id
        );

        if (existingIndex >= 0) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            boxId: box._id,
            name: box.name,
            price: box.price,
            image: box.image,
            quantity: quantity,
          });
        }

        const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        const total =
          subtotal +
          (currentCart.designCost || 0) +
          (currentCart.shipping || 0);

        localStorage.setItem(
          "cart",
          JSON.stringify({
            ...currentCart,
            items,
            subtotal,
            total,
          })
        );

        toast.success("Box added to cart!");
        // Dispatch cart update event
        window.dispatchEvent(new CustomEvent("cart"));
        return;
      }

      // For logged-in users, use API
      const payload = {
        boxId: box._id,
        quantity: quantity,
        price: box.price,
        isBox: true,
      };

      const res = await api.post(`/users/${user._id}/add-to-cart`, payload);
      const data = res?.data ?? res;
      localStorage.setItem("cart", JSON.stringify(data));

      toast.success("Box added to cart!");
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent("cart"));
    } catch (err) {
      console.error("Error adding box to cart:", err);
      toast.error("Failed to add box to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [box._id]: false }));
    }
  };

  const updateBoxQuantity = (boxId, delta) => {
    setBoxQuantities((prev) => {
      const current = prev[boxId] || 1;
      const newQuantity = Math.max(1, current + delta);
      return { ...prev, [boxId]: newQuantity };
    });
  };

  const handleQuantityInputChange = (boxId, value) => {
    // Allow empty string while typing
    if (value === "") {
      setBoxQuantities((prev) => ({ ...prev, [boxId]: "" }));
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setBoxQuantities((prev) => ({ ...prev, [boxId]: numValue }));
    }
  };

  const handleQuantityBlur = (boxId) => {
    const currentValue = boxQuantities[boxId];
    if (currentValue === "" || currentValue < 1 || isNaN(currentValue)) {
      setBoxQuantities((prev) => ({ ...prev, [boxId]: 1 }));
    }
  };

  const getBoxQuantity = (boxId) => {
    const value = boxQuantities[boxId];
    // Return empty string if user is typing, otherwise default to 1
    return value === "" ? "" : (value || 1);
  };

  // Hide the entire section if there are no boxes (after loading completes)
  if (!isLoading && !error && boxes.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-saffron-100 text-saffron-700 px-5 py-2 rounded-full">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Best Sellers</span>
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
        )}
        {!subtitle && (
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Handpicked collection of premium snack boxes for every celebration
          </p>
        )}
        <Button
          onClick={() => router.push("/boxes")}
          variant="outline"
          className="cursor-pointer border-2 border-saffron-600 text-saffron-600 hover:bg-saffron-50 px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2"
        >
          View All Boxes
          <ArrowRight size={18} />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <Skeleton className="h-56 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl p-8 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Package className="text-red-600" size={32} />
            </div>
          </div>
          <p className="text-red-800 font-medium text-lg mb-2">
            Unable to Load Featured Boxes
          </p>
          <p className="text-red-600 text-sm mb-4">
            We&apos;re having trouble loading our featured boxes. Please check
            your connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: Horizontal Slider */}
          <div className="md:hidden relative">
            <div className="overflow-x-auto scrollbar-hide py-4 -mx-4 px-4">
              <div className="flex gap-6 min-w-max">
                {boxes.map((box, index) => (
                  <motion.div
                    key={box._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="shrink-0 w-[320px]"
                  >
                    <div className="group bg-white rounded-2xl h-full flex flex-col relative overflow-hidden shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-saffron-50 to-gold-50">
                        {box.images && box.images.length > 0 ? (
                          <ImageCarousel images={box.images} height="h-full" objectFit="object-cover" />
                        ) : box.image ? (
                          <ImageCarousel images={[box.image]} height="h-full" objectFit="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="text-neutral-300" size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-saffron-600 transition-colors">
                          {box.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          {box.averageRating !== 0 && box.reviewCount !== 0 && (
                            <>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={
                                      star <= (box.averageRating || 0)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-neutral-600">
                                ({box?.reviewCount || 0})
                              </span>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
                          {box.description ||
                            "Premium snacks for every occasion"}
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-saffron-600">
                            ₹{box.price || "499"}
                          </span>
                          {box.originalPrice && (
                            <span className="text-sm text-neutral-400 line-through">
                              ₹{box.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center gap-3 mb-4 bg-neutral-50 rounded-xl py-2">
                          <button
                            onClick={() => updateBoxQuantity(box._id, -1)}
                            disabled={getBoxQuantity(box._id) <= 1}
                            className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-saffron-500"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={getBoxQuantity(box._id)}
                            onChange={(e) =>
                              handleQuantityInputChange(box._id, e.target.value)
                            }
                            onBlur={() => handleQuantityBlur(box._id)}
                            className="w-16 text-center font-bold text-lg bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Quantity"
                          />
                          <button
                            onClick={() => updateBoxQuantity(box._id, 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 transition-colors flex items-center justify-center font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-auto space-y-2">
                          <button
                            onClick={() =>
                              handleAddToCart(box, getBoxQuantity(box._id))
                            }
                            disabled={addingToCart[box._id]}
                            className="w-full bg-saffron-600 hover:bg-saffron-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                            aria-label={`Add ${box.name} to cart`}
                          >
                            {addingToCart[box._id] ? (
                              "Adding..."
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                Add to Cart
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/build-box?template=${box._id}`)
                            }
                            className="w-full border-2 border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 text-neutral-700 py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                            aria-label={`Customize ${box.name}`}
                          >
                            Customize
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBox(box);
                              setIsModalOpen(true);
                            }}
                            className="w-full border-2 border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 text-neutral-700 py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2 group/btn"
                          >
                            <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {boxes.map((box, index) => (
              <motion.div
                key={box._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="group bg-white rounded-2xl h-full flex flex-col relative overflow-hidden shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-saffron-50 to-gold-50">
                    {box.images && box.images.length > 0 ? (
                      <ImageCarousel images={box.images} height="h-full" objectFit="object-cover" />
                    ) : box.image ? (
                      <ImageCarousel images={[box.image]} height="h-full" objectFit="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="text-neutral-300" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-saffron-600 transition-colors">
                      {box.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {box.averageRating !== 0 && box.reviewCount !== 0 && (
                          <>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={
                                    star <= (box.averageRating || 0)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs text-neutral-600">
                              ({box?.reviewCount || 0})
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
                      {box.description || "Premium snacks for every occasion"}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-saffron-600">
                        ₹{box.price || "499"}
                      </span>
                      {box.originalPrice && (
                        <span className="text-sm text-neutral-400 line-through">
                          ₹{box.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center gap-3 mb-4 bg-neutral-50 rounded-xl py-2">
                      <button
                        onClick={() => updateBoxQuantity(box._id, -1)}
                        disabled={getBoxQuantity(box._id) <= 1}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={getBoxQuantity(box._id)}
                        onChange={(e) =>
                          handleQuantityInputChange(box._id, e.target.value)
                        }
                        onBlur={() => handleQuantityBlur(box._id)}
                        className="w-16 text-center font-bold text-lg bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Quantity"
                      />
                      <button
                        onClick={() => updateBoxQuantity(box._id, 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 transition-colors flex items-center justify-center font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-auto space-y-2">
                      <button
                        onClick={() =>
                          handleAddToCart(box, getBoxQuantity(box._id))
                        }
                        disabled={addingToCart[box._id]}
                        className="w-full bg-saffron-600 hover:bg-saffron-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                        aria-label={`Add ${box.name} to cart`}
                      >
                        {addingToCart[box._id] ? (
                          "Adding..."
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/build-box?template=${box._id}`)
                        }
                        className="w-full border-2 border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 text-neutral-700 py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
                        aria-label={`Customize ${box.name}`}
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBox(box);
                          setIsModalOpen(true);
                        }}
                        className="w-full border-2 border-neutral-200 hover:border-saffron-600 hover:text-saffron-600 text-neutral-700 py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2 group/btn"
                      >
                        <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <ViewBoxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        box={selectedBox}
      />
    </section>
  );
}