"use client";
import React from "react";
import { Button } from "rizzui";
import { useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { navigateToMarketplaceChat } from "@/utils/marketplaceChatNavigation";

/**
 * Marketplace Chat Button Component
 * A reusable button to start marketplace chat conversations
 */
const MarketplaceChatButton = ({
  productId,
  sellerId,
  sellerName,
  productName,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
    }

    if (!disabled && productId && sellerId) {
      navigateToMarketplaceChat(router, productId, sellerId);
    }
  };

  const buttonVariants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-50",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !productId || !sellerId}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant] || buttonVariants.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
      {...props}
    >
      {children || (
        <>
          <MessageCircle className="w-4 h-4" />
          <span>Message {sellerName ? sellerName : "Seller"}</span>
        </>
      )}
    </button>
  );
};

export const MarketplaceChatIconButton = ({
  productId,
  sellerId,
  tooltip = "Start chat",
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
    }

    if (!disabled && productId && sellerId) {
      navigateToMarketplaceChat(router, productId, sellerId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !productId || !sellerId}
      title={tooltip}
      className={`
        p-2 rounded-lg text-blue-600 hover:bg-blue-50 
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <Send className="w-4 h-4" />
    </button>
  );
};

export const MarketplaceChatQuickAction = ({
  productId,
  sellerId,
  productName,
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
    }

    if (!disabled && productId && sellerId) {
      navigateToMarketplaceChat(router, productId, sellerId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg 
        text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <MessageCircle className="w-4 h-4" />
      <span>Chat about {productName ? `"${productName}"` : "this item"}</span>
    </div>
  );
};

export default MarketplaceChatButton;
