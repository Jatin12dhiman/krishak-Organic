"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  Package, CheckCircle, Clock, Truck, MapPin, Calendar,
  CreditCard, Phone, User, Search, AlertCircle, ArrowRight,
  Box, FileText, IndianRupee, Download
} from "lucide-react";
const statusSteps = [
  { key: 'Pending', label: 'Order Placed', icon: Package, color: 'yellow' },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  { key: 'Processing', label: 'Processing', icon: Clock, color: 'purple' },
  { key: 'Shipped', label: 'Shipped', icon: Truck, color: 'cyan' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, color: 'orange' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const phoneNumberParam = searchParams.get('mobile');

  const [orderId, setOrderId] = useState(orderIdParam || '');
  const [phoneNumber, setPhoneNumber] = useState(phoneNumberParam || '');
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) return toast.error('Please enter an order ID');
    if (!phoneNumber.trim()) return toast.error('Please enter your phone number');

    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}?key=track-order&mobile=${phoneNumber}`);
      if (res.success) {
        setOrder(res.data);
        toast.success('Order found!');
      } else {
        throw new Error(res.message || 'Order not found');
      }
    } catch (error) {
      toast.error(error.message || 'Order not found');
      setOrder(null);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam?.trim() && phoneNumberParam?.trim()) handleTrack();
  }, [orderIdParam, phoneNumberParam]);

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const idx = statusSteps.findIndex(s => s.key === order.orderStatus);
    return idx >= 0 ? idx : 0;
  };

  const fmt = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID and phone number to see real-time tracking</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Search size={24} /> Find Your Order</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <input placeholder="Enter Order ID (e.g., ORD-ABC123)" value={orderId} onChange={e => setOrderId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none text-lg font-medium" />
                <Package size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <input placeholder="Enter Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none text-lg font-medium"
                  type="tel" maxLength={10} />
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <button onClick={handleTrack} disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <><Clock size={20} className="animate-spin" /> Tracking...</> : <><Search size={20} /> Track Order</>}
            </button>
            <p className="text-sm text-gray-400 mt-3">Find your order ID in the confirmation or in your profile.</p>
          </div>
        </div>

        {order && (
          <>
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 mb-8 border-2 ${order.orderStatus === 'Delivered' ? 'bg-green-50 border-green-300' : order.orderStatus === 'Cancelled' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${order.orderStatus === 'Delivered' ? 'bg-green-100 border-green-400' : order.orderStatus === 'Cancelled' ? 'bg-red-100 border-red-400' : 'bg-blue-100 border-blue-400'}`}>
                    {order.orderStatus === 'Delivered' ? <CheckCircle size={32} className="text-green-600" /> : order.orderStatus === 'Cancelled' ? <AlertCircle size={32} className="text-red-600" /> : <Truck size={32} className="text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Order #{order.orderId || order._id}</h3>
                    <p className={`text-lg font-bold mt-1 ${order.orderStatus === 'Delivered' ? 'text-green-700' : order.orderStatus === 'Cancelled' ? 'text-red-700' : 'text-blue-700'}`}>Status: {order.orderStatus}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="text-3xl font-black text-gray-900">{fmt(order.total)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock size={24} /> Order Progress</h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= getCurrentStepIndex();
                    const isCurrent = index === getCurrentStepIndex();
                    const isCompleted = index < getCurrentStepIndex();
                    return (
                      <div key={step.key} className="relative">
                        <div className="flex items-start gap-4 sm:gap-6 mb-8 last:mb-0">
                          <div className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 border-white transition-all ${isActive ? isCompleted ? 'bg-green-500' : isCurrent ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse' : 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-200'}`}>
                            <Icon size={24} className={isActive ? 'text-white' : 'text-gray-500'} />
                            {isCompleted && <div className="absolute -right-1 -top-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white"><CheckCircle size={14} className="text-white" /></div>}
                          </div>
                          <div className="flex-1 pt-2">
                            <div className={`font-bold text-lg mb-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                            {isCurrent && order.statusHistory?.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                                <Calendar size={14} />{fmtDateTime(order.statusHistory[order.statusHistory.length - 1].timestamp)}
                              </div>
                            )}
                            {isActive && !isCurrent && order.statusHistory && order.statusHistory.filter(h => h.status === step.key).map((history, idx) => (
                              <div key={idx} className="text-sm text-gray-500 mt-1 flex items-center gap-2"><CheckCircle size={14} className="text-green-600" />{fmtDateTime(history.timestamp)}</div>
                            ))}
                            {isCurrent && <div className="flex items-center gap-2 mt-2 text-sm font-bold text-green-600"><ArrowRight size={16} className="animate-pulse" />Current Status</div>}
                          </div>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute left-6 sm:left-7 w-1 transition-all ${isActive ? 'bg-gradient-to-b from-green-500 to-emerald-500' : 'bg-gray-200'}`}
                            style={{ top: '64px', height: 'calc(100% - 32px)', marginLeft: '3px' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={24} /> Order Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><Package size={18} /><span className="font-medium">Order ID</span></div><span className="font-bold text-gray-900">{order.orderId || order._id}</span></div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><Calendar size={18} /><span className="font-medium">Date</span></div><span className="font-bold text-gray-900">{fmtDate(order.createdAt)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><IndianRupee size={18} /><span className="font-medium">Total</span></div><span className="font-bold text-gray-900">{fmt(order.total)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><CreditCard size={18} /><span className="font-medium">Payment</span></div>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm border ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-300' : order.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}`}>{order.paymentStatus}</span>
                  </div>
                  {order.paymentMethod && <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><CreditCard size={18} /><span className="font-medium">Method</span></div><span className="font-bold text-gray-900">{order.paymentMethod}</span></div>}
                  {order.trackingNumber && <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-2 text-green-700"><Truck size={18} /><span className="font-medium">Tracking</span></div><span className="font-bold text-green-900">{order.trackingNumber}</span></div>}
                  {order.courierPartner && <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-2 text-gray-500"><Truck size={18} /><span className="font-medium">Courier</span></div><span className="font-bold text-gray-900">{order.courierPartner}</span></div>}
                  {order.estimatedDelivery && <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"><div className="flex items-center gap-2 text-orange-700"><Calendar size={18} /><span className="font-medium">Est. Delivery</span></div><span className="font-bold text-orange-900">{fmtDate(order.estimatedDelivery)}</span></div>}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><MapPin size={24} /> Delivery Address</h3>
                </div>
                <div className="p-6">
                  {order.shippingAddress ? (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><User size={20} className="text-green-600" /></div>
                        <p className="font-bold text-lg text-gray-900">{order.shippingAddress.name}</p>
                      </div>
                      <div className="space-y-2 text-gray-700">
                        <div className="flex items-start gap-2"><MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" /><div><p className="font-medium">{order.shippingAddress.street}</p><p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p></div></div>
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200"><Phone size={16} className="text-gray-400" /><p className="font-medium">{order.shippingAddress.phoneNumber}</p></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8"><MapPin size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No address available</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Box size={24} /> Order Items ({order.items.length})</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-green-300 transition-all">
                        {item.image && <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border border-green-300">Qty: {item.quantity}</span>
                            <span className="text-gray-500">Price: <span className="font-bold text-gray-900">{fmt(item.price)}</span></span>
                          </div>
                        </div>
                        <div className="text-right sm:text-left w-full sm:w-auto">
                          <p className="text-sm text-gray-500 mb-1">Item Total</p>
                          <p className="text-2xl font-black text-gray-900">{fmt(item.total || item.quantity * item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Summary */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-3">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-semibold">{fmt(order.subtotal)}</span></div>
                    {order.tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span className="font-semibold">{fmt(order.tax)}</span></div>}
                    {order.shippingCharges > 0 && <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-semibold">{fmt(order.shippingCharges)}</span></div>}
                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-semibold">-{fmt(order.discount)}</span></div>}
                    <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t-2 border-gray-200"><span>Total Amount</span><span>{fmt(order.total)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!order && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">{orderIdParam ? 'Order Not Found' : 'Start Tracking'}</h3>
            <p className="text-gray-500 mb-6">{orderIdParam ? 'No order found. Please check and try again.' : 'Enter your order ID and phone number above to track your order.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
