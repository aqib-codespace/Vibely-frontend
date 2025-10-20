"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Button } from "rizzui";
import { Search, ShoppingBag, Loader2, XCircle } from "lucide-react";

const MarketplaceChatSidebar = ({
  chats = [],
  selectedChat,
  onSelectChat,
  isLoading = false,
  hasMoreChats = false,
  onLoadMoreChats,
  isMobile = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const user = useSelector((state) => state.auth.user);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return `$${price}`;
  };

  const getOtherParticipant = (chat) => {
    if (!chat?.participants || !user) return null;
    const currentUserId = user._id || user.id;
    return chat.participants.find(
      (participant) => participant._id !== currentUserId
    );
  };

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";

    switch (message.messageType) {
      case "image":
        return "📷 Photo";
      case "product_share":
        return "📦 Shared a product";
      case "offer":
        return "💰 Made an offer";
      default:
        return message.content || "Message";
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;

    const otherParticipant = getOtherParticipant(chat);
    const productName = chat.productRef?.name || "";
    const participantName = otherParticipant
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
      : "";

    return (
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderChatItem = (chat) => {
    const otherParticipant = getOtherParticipant(chat);
    const isSelected = selectedChat?._id === chat._id;
    const productImage = chat.productRef?.images?.[0]?.url;

    return (
      <div
        key={chat._id}
        onClick={() => onSelectChat(chat)}
        className={`
          flex items-center gap-3 p-3 cursor-pointer transition-all duration-200
          hover:bg-gray-100 border-b border-gray-100 last:border-b-0
          ${isSelected ? "bg-gray-50" : ""}
        `}
      >
        <div className="relative flex-shrink-0">
          <Avatar
            src={otherParticipant?.profilePicture?.url || "/avatar.webp"}
            name={`${otherParticipant?.firstName || ""} ${
              otherParticipant?.lastName || ""
            }`}
            className="h-10 w-10"
          />

          {productImage && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden">
              <img
                src={productImage}
                alt={chat.productRef?.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm truncate">
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h4>
            <div className="flex items-center gap-2 ml-2">
              {chat.productRef?.price && (
                <span className="text-xs font-semibold text-green-600">
                  {formatPrice(chat.productRef.price)}
                </span>
              )}
              {chat.lastMessage && (
                <span className="text-xs text-gray-400">
                  {formatTime(chat.lastMessage.createdAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-blue-600 font-medium truncate max-w-[60%]">
              {chat.productRef?.name || "Product"}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <p className="text-xs text-gray-500 truncate flex-1">
              {formatLastMessage(chat.lastMessage)}
            </p>
          </div>

          {chat.unreadCount > 0 && (
            <div className="flex justify-end mt-1">
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading && chats.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats or products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-500">Loading marketplace chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No chats found" : "No marketplace chats yet"}
            </h3>
            <p className="text-gray-500 text-center">
              {searchQuery
                ? "Try searching for a different product or user"
                : "Start chatting with sellers about products you're interested in"}
            </p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                Search Results ({filteredChats.length})
              </div>
            )}

            <div>{filteredChats.map((chat) => renderChatItem(chat))}</div>

            {hasMoreChats && !searchQuery && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={onLoadMoreChats}
                  disabled={isLoading}
                  className="w-full py-2 px-4 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    "Load More Chats"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceChatSidebar;
