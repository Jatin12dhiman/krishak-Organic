"use client";
import React from "react";
import { X, Package, Box as BoxIcon, Layers, Info } from "lucide-react";
import Modal from "@/components/ui/Modal.jsx";
import Image from "next/image";
import ImageCarousel from "./ImageCarousel";
import { getImageUrl } from "@/lib/utils";

export default function ViewBoxModal({ isOpen, onClose, box }) {
    if (!isOpen || !box) return null;

    const { name, description, image, items, price, originalPrice } = box;

    return (
        <Modal open={isOpen} onClose={onClose} title={name || "Box Details"}>
            <div className="space-y-6">
                {/* Box Images Carousel */}
                <div className="w-full">
                    {box.images && box.images.length > 0 ? (
                        <ImageCarousel images={box.images} height="aspect-video" />
                    ) : image ? (
                        <ImageCarousel images={[image]} height="aspect-video" />
                    ) : (
                        <div className="aspect-video relative rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
                            <Package size={48} className="text-neutral-300" />
                        </div>
                    )}
                </div>

                {/* Price Tag (Optional, but good for context) */}
                <div className="flex items-center justify-between bg-saffron-50 p-4 rounded-xl border border-saffron-100">
                    <div>
                        <p className="text-sm text-saffron-700 font-medium">Starting at</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-saffron-600">₹{price}</span>
                            {originalPrice && (
                                <span className="text-sm text-neutral-400 line-through">₹{originalPrice}</span>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <BoxIcon className="text-saffron-600" size={24} />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h4 className="flex items-center gap-2 font-bold text-neutral-900">
                        <Info size={18} className="text-saffron-600" />
                        Description
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-sm">
                        {description || "A premium curated box filled with delicious snacks carefully selected for the best experience."}
                    </p>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-bold text-neutral-900">
                        <Layers size={18} className="text-saffron-600" />
                        What&apos;s Inside ({items?.length || 0} unique items)
                    </h4>
                    <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                        {items && items.length > 0 ? (
                            items.map((boxItem, idx) => {
                                const item = boxItem.itemId;
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors group"
                                    >
                                        <div className="relative w-14 h-14 bg-white rounded-lg border border-neutral-100 overflow-hidden shrink-0">
                                            {item?.image ? (
                                                <Image
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                                    <Package size={20} className="text-neutral-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-neutral-900 truncate text-sm">
                                                {item?.name || "Unnamed Item"}
                                            </p>
                                            <p className="text-xs text-neutral-500 font-medium bg-neutral-100 inline-block px-2 py-0.5 rounded mt-1">
                                                Quantity: {boxItem.quantity || 1}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                                <Package size={32} className="mx-auto text-neutral-300 mb-2" />
                                <p className="text-neutral-500 text-sm">No items listed for this box</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
