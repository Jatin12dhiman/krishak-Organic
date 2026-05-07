"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/AuthProvider.jsx";
import Button from "@/components/ui/Button.jsx";
import {
  LogOut,
  Menu,
  X,
  Bell,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  ChevronDown,
  Package,
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export default function Header({ initialCategories, initialConfig }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoError, setLogoError] = useState(false);
  // const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false); // Removed
  const [categories, setCategories] = useState(initialCategories || []);
  const [headerBanner, setHeaderBanner] = useState(
    initialConfig?.headerBanner || {
      title: "Special Offer: 20% OFF on bulk orders | Free delivery above ₹999",
      subtitle: "",
    }
  );
  const [minBoxQuantity, setMinBoxQuantity] = useState(
    initialConfig?.minimumBoxOrderQuantity ||
    initialConfig?.minOrderQuantity ||
    initialConfig?.minimumBoxQuantity ||
    1
  );

  const navLinks = [
    { label: "Home", href: "/" },
    ...categories.slice(0, 5).map(category => ({
      label: category.name,
      href: `/products?category=${category._id}`
    })),
    { label: "Products", href: "/products" },
  ];

  // Fetch categories
  useEffect(() => {
    if (initialCategories) return;
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories?limit=100");
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.categories || data?.items || [];
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [initialCategories]);

  // Fetch notifications every minute
  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications?userId=${user._id}`);
        if (res.success) {
          const data = res.data;
          setNotifications(data.notifications || []);
          const unread =
            data.notifications?.filter(
              (notification) =>
                !notification.readBy?.some(
                  (r) => r._id?.toString() === user._id?.toString()
                )
            ).length || 0;
          setUnreadCount(unread);
        }
      } catch {
        // Notifications API may not exist yet — silently ignore
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Set up interval for every minute
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, [user?._id]);

  const fetchCartData = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          const cartData = JSON.parse(localCart);
          setCartData(cartData);
          setCartCount(cartData.items?.length || 0);
        }
      }

      if (user?._id) {
        try {
          const res = await api.get(`/users/${user._id}/get-carts`);
          if (res.success) {
            const cartData = res.data;
            setCartData(cartData);
            setCartCount(cartData.items?.length || 0);

            if (typeof window !== "undefined") {
              localStorage.setItem("cart", JSON.stringify(cartData));
            }
          }
        } catch {
          // Cart API may not exist yet — silently use localStorage
        }
      }
    } catch (error) {
      // Fallback to localStorage on any error
      if (typeof window !== "undefined") {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          const cartData = JSON.parse(localCart);
          setCartData(cartData);
          const totalItems =
            cartData.items?.reduce((total, item) => total + item.quantity, 0) ||
            0;
          setCartCount(totalItems);
        }
      }
    }
  }, [user?._id]);

  // Fetch cart data periodically (only when user is logged in)
  useEffect(() => {
    // Fetch immediately
    fetchCartData();

    // Set up interval for every 30 seconds (not 1s to avoid hammering the server)
    const interval = setInterval(() => {
      fetchCartData();
    }, 30000);

    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener("cart", handleCartUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("cart", handleCartUpdate);
    };
  }, [fetchCartData]);

  // Fetch header banner from system config
  useEffect(() => {
    if (initialConfig) return;
    const fetchHeaderBanner = async () => {
      try {
        const res = await api.get("/system-config");
        const data = res?.data ?? res;
        if (data?.headerBanner) {
          setHeaderBanner(data.headerBanner);
        }
        if (data?.minimumBoxOrderQuantity) {
          setMinBoxQuantity(data.minimumBoxOrderQuantity);
        } else if (data?.minOrderQuantity) {
          setMinBoxQuantity(data.minOrderQuantity);
        } else if (data?.minimumBoxQuantity) {
          setMinBoxQuantity(data.minimumBoxQuantity);
        }

      } catch {
        // System config may not exist yet — silently ignore
      }
    };

    fetchHeaderBanner();
  }, [initialConfig]);

  const handleLogout = async () => {
    await logout();
    try {
      await api.post(`/users/${user.userId || user._id}/clear-cart`);
    } catch {
      // clear-cart API may not exist yet
    }
    localStorage.removeItem("cart");
    window.location.href = '/'
    setMobileMenuOpen(false);
  };

  const markAsRead = async (notificationIds) => {
    try {
      const response = await api.post("/notifications/mark-as-read", {
        userId: user._id,
        notificationIds,
      });

      if (response.ok) {
        const updatedNotifications = notifications.map((notification) =>
          notificationIds.includes(notification._id)
            ? {
              ...notification,
              readBy: [...(notification.readBy || []), user._id],
            }
            : notification
        );
        setNotifications(updatedNotifications);

        const newUnreadCount = updatedNotifications.filter(
          (notification) => !notification.readBy?.includes(user._id)
        ).length;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    const notificationIds = [notification._id];

    if (!notification.readBy?.includes(user._id)) {
      markAsRead(notificationIds);
    }

    setNotificationMenuOpen(false);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.readBy?.includes(user._id)
    );

    if (unreadNotifications.length === 0) return;

    const notificationIds = unreadNotifications.map(
      (notification) => notification._id
    );
    await markAsRead(notificationIds);
  };

  const handleCartClick = () => {
    setCartSidebarOpen(true);
    fetchCartData();
  };

  const handleCategoryClick = (categoryId) => {
    router.push(`/menu?category=${categoryId}`);
    setCategoriesDropdownOpen(false);
  };

  const updateQuantity = async (itemId, newQuantity, boxId = null, itemIndex = null) => {
    if (newQuantity < 1) return;

    // Check minimum box quantity constraint
    const isBox = !!boxId || (itemIndex !== null && cartData?.items?.[itemIndex]?.isBox);
    if (isBox && newQuantity < minBoxQuantity) {
      // Optionally toast here
      return;
    }

    try {
      setLoading(true);
      const userId = user?._id;

      if (!userId) {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
        const items = currentCart.items || [];

        let targetIndex = -1;

        if (itemIndex !== null && itemIndex >= 0 && itemIndex < items.length) {
          targetIndex = itemIndex;
        } else {
          targetIndex = items.findIndex((item) => {
            if (boxId) {
              const itemBoxId = item.boxId?._id || item.boxId;
              return itemBoxId && String(itemBoxId) === String(boxId);
            } else {
              const itemIdValue = item.itemId?._id || item.itemId;
              return (
                itemIdValue &&
                String(itemIdValue) === String(itemId) &&
                !item.boxId
              );
            }
          });
        }

        if (targetIndex >= 0) {
          items[targetIndex].quantity = newQuantity;
          const subtotal = items.reduce(
            (sum, i) => sum + i.quantity * i.price,
            0
          );
          const total = subtotal + (currentCart.designCost || 0) + (currentCart.shipping || 0);

          const updatedCart = {
            ...currentCart,
            items,
            subtotal,
            total,
          };

          localStorage.setItem("cart", JSON.stringify(updatedCart));
          setCartData(updatedCart);
          setCartCount(updatedCart.items?.length || 0);

          window.dispatchEvent(new CustomEvent("cart"));
        }
        return;
      }

      // For logged-in users, use API
      // Note: Backend might not support index-based update for custom boxes yet.
      // But we pass it anyway or fallback to ID.
      // For logged-in users, use API
      let cartItem = null;

      // Try finding by index first if available as it's most reliable for duplicates/custom items
      if (itemIndex !== null && itemIndex >= 0 && cartData?.items?.[itemIndex]) {
        cartItem = cartData.items[itemIndex];
      }

      // Fallback to finding by ID if index didn't work
      if (!cartItem) {
        cartItem = cartData?.items?.find((item) => {
          if (boxId) {
            const itemBoxId = item.boxId?._id || item.boxId;
            return itemBoxId && String(itemBoxId) === String(boxId);
          } else {
            const itemIdValue = item.itemId?._id || item.itemId;
            return (
              itemIdValue && String(itemIdValue) === String(itemId) && !item.boxId
            );
          }
        });
      }

      if (!cartItem) {
        console.error("Item/Box not found in cart");
        return;
      }

      let payload = {};

      const isCustomBox = cartItem.isCustomized || (cartItem.isBox && !cartItem.boxId);

      if (isCustomBox) {
        payload = {
          cartItemId: cartItem._id, // Direct update target
          isCustomized: true,
          boxId: cartItem.boxId || null,
          quantity: newQuantity,
          price: cartItem.price,
          setQuantity: true,
          customizedItems: cartItem.customizedItems || [],
          designId: cartItem.designId,
          designType: cartItem.designType,
          designCost: cartItem.designCost,
          isBox: true
        };
      } else if (boxId) {
        payload = {
          cartItemId: cartItem._id, // Direct update target
          boxId: boxId,
          quantity: newQuantity,
          price: cartItem.price,
          setQuantity: true,
        };
      } else {
        payload = {
          cartItemId: cartItem._id, // Direct update target
          itemId: itemId,
          quantity: newQuantity,
          price: cartItem.price,
          setQuantity: true,
        };
      }

      const res = await api.post(`/users/${userId}/add-to-cart`, payload);
      const data = res?.data ?? res;

      setCartData(data);
      localStorage.setItem("cart", JSON.stringify(data));

      const totalItems =
        data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      setCartCount(totalItems);

      window.dispatchEvent(new CustomEvent("cart"));
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId, boxId = null, itemIndex = null) => {
    try {
      setLoading(true);
      const userId = user?._id;

      // For guest users, update localStorage
      if (!userId) {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "{}");
        const items = currentCart.items || [];
        let filteredItems;

        if (itemIndex !== null && itemIndex >= 0 && itemIndex < items.length) {
          filteredItems = items.filter((_, idx) => idx !== itemIndex);
        } else {
          filteredItems = items.filter((item) => {
            if (boxId) {
              const itemBoxId = item.boxId?._id || item.boxId;
              return !itemBoxId || String(itemBoxId) !== String(boxId);
            } else {
              const itemIdValue = item.itemId?._id || item.itemId;
              return (
                !itemIdValue ||
                String(itemIdValue) !== String(itemId) ||
                item.boxId
              );
            }
          });
        }

        const subtotal = filteredItems.reduce(
          (sum, i) => sum + i.quantity * i.price,
          0
        );
        const total =
          subtotal +
          (currentCart.designCost || 0) +
          (currentCart.shipping || 0);

        const updatedCart = {
          ...currentCart,
          items: filteredItems,
          subtotal,
          total,
        };

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartData(updatedCart);
        setCartCount(updatedCart.items?.length || 0);

        window.dispatchEvent(new CustomEvent("cart"));
        return;
      }

      // For logged-in users, use API
      const payload = boxId ? { boxId } : { itemId };
      if (itemIndex !== null) {
        payload.itemIndex = itemIndex;
      }

      try {
        const res = await api.post(`/users/${userId}/remove-from-cart`, payload);
        const data = res?.data ?? res;

        if (data && data.items) {
          setCartData(data);
          localStorage.setItem("cart", JSON.stringify(data));
          setCartCount(data.items.length);
          window.dispatchEvent(new CustomEvent("cart"));
        } else {
          if (itemIndex === null && cartData?.items) {
            const itemToRemove = cartData.items.find((item, idx) => {
              if (boxId) {
                const itemBoxId = item.boxId?._id || item.boxId;
                return itemBoxId && String(itemBoxId) === String(boxId);
              } else {
                const itemIdValue = item.itemId?._id || item.itemId;
                return itemIdValue && String(itemIdValue) === String(itemId);
              }
            });

            if (itemToRemove) {
              const foundIndex = cartData.items.indexOf(itemToRemove);
              if (foundIndex >= 0) {
                await removeItem(itemId, boxId, foundIndex);
                return;
              }
            }
          }

          await fetchCartData();
        }
      } catch (apiError) {
        console.error("API error removing item:", apiError);
        if (itemIndex !== null && cartData?.items) {
          const updatedItems = cartData.items.filter((_, idx) => idx !== itemIndex);
          const updatedCart = {
            ...cartData,
            items: updatedItems,
            subtotal: updatedItems.reduce((sum, i) => sum + i.quantity * i.price, 0),
          };
          setCartData(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          setCartCount(updatedItems.length);
          window.dispatchEvent(new CustomEvent("cart"));

          try {
            await fetchCartData();
          } catch (e) {
            console.error("Error syncing cart:", e);
          }
        } else {
          await fetchCartData();
        }
      }
    } catch (err) {
      console.error("Error removing item:", err);
      try {
        await fetchCartData();
      } catch (e) {
        console.error("Error refreshing cart:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkoutFromCart", "true");
    }
    setCartSidebarOpen(false);
    router.push("/checkout");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Promotional Banner */}
      {headerBanner?.title && (
        <div className="bg-neutral-900 text-white py-1.5 px-4 text-center text-[11px] md:text-xs">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-0.5 font-medium"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="hidden md:inline">🎉</span>
              <span dangerouslySetInnerHTML={{ __html: headerBanner.title }} />
            </div>
            {headerBanner.subtitle && (
              <div className="text-xs opacity-90 mt-1">
                {headerBanner.subtitle}
              </div>
            )}
          </motion.div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer h-10 md:h-14"
              onClick={() => router.push("/")}
            >
              <div className="flex items-center justify-center bg-emerald-100 w-8 h-8 md:w-10 md:h-10 rounded-lg">
                <span className="text-lg md:text-xl">🌿</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-emerald-600 tracking-tight">
                Krishak
              </span>
            </motion.div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center flex-1 max-w-3xl mx-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search organic products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </form>
            </nav>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-1 mr-4">
              {navLinks.map((link) => (
                <motion.button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-sm cursor-pointer font-semibold text-neutral-700 hover:text-emerald-600 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </motion.button>
              ))}
            </div>

            {/* Desktop Auth Section - Right */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart Button - Always visible */}
              <motion.button
                onClick={handleCartClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
              >
                <ShoppingCart size={22} strokeWidth={2} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </motion.button>

              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {/* Notification Bell */}
                  <div className="relative">
                    <motion.button
                      onClick={() =>
                        setNotificationMenuOpen(!notificationMenuOpen)
                      }
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative p-2 text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          filter:
                            unreadCount > 0
                              ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))"
                              : "none",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Bell size={20} />
                      </motion.div>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {notificationMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50"
                        >
                          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200">
                            <h3 className="font-semibold text-neutral-800">
                              Notifications
                            </h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-neutral-500">
                                No notifications
                              </div>
                            ) : (
                              notifications.map((notification) => {
                                const isUnread = !notification.readBy?.includes(
                                  user._id
                                );
                                return (
                                  <div
                                    key={notification._id}
                                    onClick={() =>
                                      handleNotificationClick(notification)
                                    }
                                    className={`px-4 py-3 border-b border-neutral-100 last:border-b-0 cursor-pointer transition-colors ${isUnread
                                      ? "bg-emerald-50 hover:bg-emerald-100"
                                      : "hover:bg-neutral-50"
                                      }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {isUnread && (
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`font-medium text-sm ${isUnread
                                            ? "text-neutral-900"
                                            : "text-neutral-600"
                                            }`}
                                        >
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-2">
                                          {new Date(
                                            notification.createdAt
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Button */}
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </button>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 border-neutral-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="cursor-pointer"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push("/signup")}
                    size="sm"
                    className="cursor-pointer"
                  >
                    Sign Up
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Mobile Cart Button */}
              <button
                onClick={handleCartClick}
                className="p-2 text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors relative"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden border-t border-neutral-200"
              >
                <div className="py-4 space-y-2">
                  {/* Mobile Navigation Links */}
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => {
                        router.push(link.href);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}

                  {/* Mobile Categories Section - Removed as they are in main nav now */}

                  {/* Mobile Cart Section - Always visible */}
                  <button
                    onClick={() => {
                      handleCartClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </div>
                    <span>Cart ({cartCount} items)</span>
                  </button>

                  {/* Mobile Notification Section */}
                  {user && notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-neutral-200">
                      <h3 className="font-semibold text-neutral-800 mb-2">
                        Notifications
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => {
                          const isUnread = !notification.readBy?.includes(
                            user._id
                          );
                          return (
                            <div
                              key={notification._id}
                              onClick={() => {
                                handleNotificationClick(notification);
                                setMobileMenuOpen(false);
                              }}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${isUnread
                                ? "bg-emerald-50 border-saffron-200"
                                : "bg-neutral-50 border-neutral-200"
                                }`}
                            >
                              <p
                                className={`font-medium text-sm ${isUnread
                                  ? "text-neutral-900"
                                  : "text-neutral-600"
                                  }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mobile Auth Section */}
                  <div className="pt-4 border-t border-neutral-200">
                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            router.push("/profile");
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-xs text-neutral-500">
                              View Profile
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-3 mt-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            router.push("/login");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          Sign In
                        </Button>
                        <Button
                          onClick={() => {
                            router.push("/signup");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {cartSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 bg-opacity-50 z-50"
              onClick={() => setCartSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Shopping Cart ({cartData?.items?.length || 0} items)
                </h2>
                <button
                  onClick={() => setCartSidebarOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {!cartData || cartData.items?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart size={48} className="text-neutral-300 mb-4" />
                    <p className="text-neutral-500 text-lg mb-2">
                      Your cart is empty
                    </p>
                    <p className="text-neutral-400 text-sm">
                      Add some items to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartData.items.map((item, index) => {
                      // Check if it's a box or an item
                      const isBox = !!(item.boxId || item.isBox || item.isCustomized);
                      const isCustomized = item.isCustomized || false;
                      const boxId = item.boxId?._id || item.boxId;
                      const boxIdStr = boxId ? String(boxId) : null;
                      const itemData = item.itemId || {};
                      const imageSrc = isBox
                        ? item.image || item.boxId?.image || "/next.svg"
                        : itemData.image || "/next.svg";

                      const itemName = isBox
                        ? isCustomized
                          ? `${item.name || item.boxId?.name || "Box"
                          } (Customized)`
                          : item.name || item.boxId?.name || "Box"
                        : itemData.name || item.name || "Item";
                      const hasValidImage = imageSrc && imageSrc.trim() !== "";
                      const uniqueId = isBox
                        ? boxId || `box-${index}`
                        : item.itemId?._id ||
                        item.itemId ||
                        item._id ||
                        `item-${index}`;

                      return (
                        <div
                          key={uniqueId}
                          className="flex gap-4 p-4 border border-neutral-200 rounded-lg"
                        >
                          {/* Item/Box Image */}
                          <div className="shrink-0">
                            {hasValidImage ? (
                              <Image
                                src={getImageUrl(imageSrc)}
                                alt={itemName}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover h-24 w-24"
                              />
                            ) : (
                              <div className="rounded-lg bg-neutral-200 h-24 w-24 flex items-center justify-center">
                                <ShoppingCart
                                  size={32}
                                  className="text-neutral-400"
                                />
                              </div>
                            )}
                          </div>

                          {/* Item/Box Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                {isBox && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded mb-1 inline-block ${isCustomized
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-purple-100 text-purple-700"
                                      }`}
                                  >
                                    {isCustomized ? "Customized Box" : "Box"}
                                  </span>
                                )}
                                <h3 className="font-medium text-neutral-800 truncate">
                                  {itemName}
                                </h3>
                                {!isBox &&
                                  (itemData.quantity ||
                                    itemData.quantityType) && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                      {itemData.quantity &&
                                        itemData.quantityType
                                        ? `${itemData.quantity} ${itemData.quantityType}`
                                        : itemData.quantity
                                          ? `${itemData.quantity}`
                                          : itemData.quantityType
                                            ? itemData.quantityType
                                            : ""}
                                    </p>
                                  )}
                                {isCustomized && item.customizedItems && (
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {item.customizedItems.length} item
                                    {item.customizedItems.length !== 1
                                      ? "s"
                                      : ""}
                                    {item.designCost > 0 &&
                                      ` + Design (₹${item.designCost})`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-emerald-600 font-semibold mt-1">
                              ₹{item.price}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 mt-3">
                              <div className="relative group">
                                <button
                                  onClick={() => {
                                    if (isBox && boxIdStr) {
                                      updateQuantity(
                                        boxIdStr,
                                        item.quantity - 1,
                                        boxIdStr,
                                        index // Pass index
                                      );
                                    } else if (isBox && !boxIdStr) {
                                      // Custom box without ID
                                      updateQuantity(null, item.quantity - 1, null, index);
                                    } else {
                                      const itemIdValue =
                                        itemData._id ||
                                        item.itemId?._id ||
                                        item.itemId;
                                      if (itemIdValue)
                                        updateQuantity(
                                          String(itemIdValue),
                                          item.quantity - 1,
                                          null,
                                          index
                                        );
                                    }
                                  }}
                                  disabled={loading || item.quantity <= 1 || (isBox && item.quantity <= minBoxQuantity)}
                                  className="p-1 rounded-full border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={16} />
                                </button>
                                {isBox && item.quantity <= minBoxQuantity && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Min quantity: {minBoxQuantity}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                                  </div>
                                )}
                              </div>

                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => {
                                  if (isBox && boxIdStr) {
                                    updateQuantity(
                                      boxIdStr,
                                      item.quantity + 1,
                                      boxIdStr,
                                      index
                                    );
                                  } else if (isBox && !boxIdStr) {
                                    // Custom box without ID
                                    updateQuantity(null, item.quantity + 1, null, index);
                                  } else {
                                    const itemIdValue =
                                      itemData._id ||
                                      item.itemId?._id ||
                                      item.itemId;
                                    if (itemIdValue)
                                      updateQuantity(
                                        String(itemIdValue),
                                        item.quantity + 1,
                                        null,
                                        index
                                      );
                                  }
                                }}
                                disabled={loading}
                                className="p-1 rounded-full border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>

                              {/* Remove Button */}
                              <button
                                onClick={() => {
                                  if (isBox && boxIdStr) {
                                    removeItem(null, boxIdStr, index);
                                  } else {
                                    const itemIdValue =
                                      itemData._id ||
                                      item.itemId?._id ||
                                      item.itemId;
                                    if (itemIdValue) {
                                      removeItem(String(itemIdValue), null, index);
                                    } else {
                                      console.warn("Item has no valid itemId, removing by index:", index);
                                      removeItem(null, null, index);
                                    }
                                  }
                                }}
                                disabled={loading}
                                className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Item/Box Total */}
                            <div className="mt-2 text-right">
                              <p className="text-sm text-neutral-600">
                                Total:{" "}
                                <span className="font-semibold">
                                  ₹{item.price * item.quantity}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartData && cartData.items?.length > 0 && (
                <div className="border-t border-neutral-200 p-4 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="text-lg font-semibold">
                      ₹{cartData.subtotal || 0}
                    </span>
                  </div>

                  {/* Checkout Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleCheckout}
                      className="w-full cursor-pointer"
                      disabled={loading}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCartSidebarOpen(false)}
                      className="w-full cursor-pointer"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

