"use client";
import React, { useState, useEffect } from "react";
import MarketplaceChatSidebar from "./marketplace-chat-sidebar";
import MarketplaceChatScreen from "./marketplace-chat-screen";
import { useMarketplaceChat } from "@/hooks/useMarketplaceChat";
import { useRouter, useSearchParams } from "next/navigation";

const MarketplaceChatMainPage = ({ productId = null, sellerId = null }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const urlProductId = searchParams.get("productId");
  const urlSellerId = searchParams.get("sellerId");
  const finalProductId = productId || urlProductId;
  const finalSellerId = sellerId || urlSellerId;

  const {
    selectedChat,
    currentChat,
    messages,
    chats,
    isSocketConnected,
    isLoadingMessages,
    isLoadingMoreMessages,
    isLoadingChats,
    hasMoreMessages,
    hasMoreChats,
    handleAccessOrCreateChat,
    handleSelectChat,
    handleSendMessage,
    handleFetchChats,
    handleStartTyping,
    handleStopTyping,
    handleToggleReaction,
    typingUsers,
    loadMoreMessages,
    loadMoreChats,
    refreshMessages,
    socketManager,
  } = useMarketplaceChat(finalProductId, finalSellerId);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);

      if (width < 640 && selectedChat) {
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [selectedChat]);

  useEffect(() => {
    if ((isMobile || isTablet) && selectedChat) {
      setShowSidebar(false);
    }
  }, [selectedChat, isMobile, isTablet]);

  useEffect(() => {
    handleFetchChats(1, true);
  }, []);

  const handleChatSelection = (chat) => {
    handleSelectChat(chat);
    if (isMobile || isTablet) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg h-[calc(100vh-130px)]">
      <div
        className={`
          ${showSidebar ? "block" : "hidden"} 
          ${isMobile || isTablet ? "w-full" : "w-1/4 md:block"} 
          border-r border-gray-200 h-full overflow-hidden transition-all duration-300
        `}
      >
        <MarketplaceChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleChatSelection}
          isLoading={isLoadingChats}
          hasMoreChats={hasMoreChats}
          onLoadMoreChats={loadMoreChats}
          isMobile={isMobile || isTablet}
        />
      </div>

      <div
        className={`
          ${!showSidebar || (!isMobile && !isTablet) ? "block" : "hidden"} 
          ${isMobile || (isTablet && !showSidebar) ? "w-full" : "w-3/4"} 
          h-full transition-all duration-300 relative
        `}
      >
        <MarketplaceChatScreen
          selectedChat={selectedChat}
          currentChat={currentChat}
          messages={messages}
          isSocketConnected={isSocketConnected}
          isLoadingMessages={isLoadingMessages}
          isLoadingMoreMessages={isLoadingMoreMessages}
          hasMoreMessages={hasMoreMessages}
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          onToggleReaction={handleToggleReaction}
          typingUsers={typingUsers}
          onLoadMoreMessages={loadMoreMessages}
          onRefreshMessages={refreshMessages}
          socketManager={socketManager}
          isMobile={isMobile || isTablet}
          onToggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
        />
      </div>
    </div>
  );
};

export default MarketplaceChatMainPage;
