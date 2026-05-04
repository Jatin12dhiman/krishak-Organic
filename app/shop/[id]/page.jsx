"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "@/lib/api";
import { getMe } from "@/lib/auth";
import { toast } from "react-hot-toast";
import {
  ShoppingCart, ArrowLeft, Star, Leaf, Shield, Truck,
  Plus, Minus, Tag, CheckCircle, Package
} from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const data = res?.data ?? res;
        setItem(data);
      } catch {
        toast.error("Product not found");
        router.push("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!item) return;
    setAdding(true);
    try {
      let user = null;
      try {
        const userRes = await getMe();
        if (userRes.success && userRes.data) user = userRes.data;
      } catch {}

      if (!user?._id) {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
        const items = currentCart.items || [];
        const existing = items.findIndex(it => it.itemId === item._id);
        if (existing >= 0) {
          items[existing].quantity += quantity;
        } else {
          items.push({ itemId: item._id, name: item.name, price: item.price, image: item.image, quantity });
        }
        const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
        localStorage.setItem("cart", JSON.stringify({ ...currentCart, items, subtotal, total: subtotal }));
        toast.success("Added to cart!");
        window.dispatchEvent(new CustomEvent("cart"));
        return;
      }

      await api.post(`/users/${user._id}/add-to-cart`, { itemId: item._id, quantity, price: item.price });
      toast.success("Added to cart!");
      window.dispatchEvent(new CustomEvent("cart"));
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const discount = item.oldPrice && item.oldPrice > item.price
    ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.push("/")} className="hover:text-green-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => router.back()} className="hover:text-green-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{item.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg aspect-square">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50">
                  <Leaf size={80} className="text-green-200" />
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow">
                  {discount}% OFF
                </div>
              )}
              {item.isBuyOneGetOne && (
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                  <Tag size={12} /> BUY 1 GET 1
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: Leaf, label: "100% Organic" },
                { icon: Shield, label: "Quality Assured" },
                { icon: Truck, label: "Fast Delivery" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                  <Icon size={20} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Category badge */}
            {item.category?.name && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {item.category.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{item.name}</h1>

            {/* Rating */}
            {item.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={18} className={s <= Math.round(item.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-600">{item.averageRating?.toFixed(1)} ({item.reviewCount || 0} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900">₹{item.price}</span>
              {item.oldPrice > item.price && (
                <span className="text-xl text-gray-400 line-through mb-1">₹{item.oldPrice}</span>
              )}
              {discount > 0 && (
                <span className="text-lg font-black text-green-600 mb-1">Save {discount}%</span>
              )}
            </div>

            {/* Quantity & Weight */}
            {(item.quantity || item.quantityType) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={16} className="text-green-600" />
                <span className="font-semibold">{item.quantity} {item.quantityType}</span>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {item.inStock !== false ? (
                <><CheckCircle size={16} className="text-green-600" /><span className="text-green-700 font-semibold text-sm">In Stock</span></>
              ) : (
                <span className="text-red-500 font-semibold text-sm">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Quantity selector */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors font-bold text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-black text-lg text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors font-bold text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-gray-500 text-sm font-semibold">
                  Total: <span className="text-gray-900 font-black">₹{item.price * quantity}</span>
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={adding || item.inStock === false}
                className="flex-1 py-4 text-lg font-black bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart().then(() => router.push("/checkout"));
                }}
                disabled={adding || item.inStock === false}
                className="flex-1 py-4 text-lg font-black bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-all"
              >
                Buy Now
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
