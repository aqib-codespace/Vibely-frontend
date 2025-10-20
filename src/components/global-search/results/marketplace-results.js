"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag, MapPin, Calendar } from "lucide-react";
import { stripHtml } from "@/utils/html-utils";

const MarketplaceSearchResults = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No marketplace items found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const itemId = item._id;
        const name = item.name;
        const description = item.description;
        const price = item.price;
        const category = item.category;
        const createdAt = item.createdAt;
        const images = item.images || [];
        const imageUrl = images.length > 0 ? images[0].url : "/not-found.png";
        const seller = item.seller || {};
        const sellerName = `${seller.firstName || ""} ${
          seller.lastName || ""
        }`.trim();

        return (
          <Link
            key={itemId}
            href={`/marketplace/${itemId}`}
            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-3">
              <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-1 left-1">
                  {images.length > 1 && (
                    <div className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-sm">
                      {images.length}+
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-1">{name}</h4>
                <p className="text-green-600 font-medium text-sm mt-1">
                  ${price.toFixed(2)}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {stripHtml(description)}
                  </p>
                )}{" "}
                <div className="mt-1.5 flex items-center">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <span className="ml-1 text-xs text-gray-500 capitalize">
                    {category}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  {sellerName && (
                    <div className="text-xs text-gray-500">
                      Listed by: {sellerName}
                    </div>
                  )}

                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MarketplaceSearchResults;
