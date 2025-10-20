"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatSidebar from "./chat-sidebar";
import ChatScreen from "./chat-screen";
import MarketplaceChatSidebar from "../marketPlace/marketplace-chat/marketplace-chat-sidebar";
import MarketplaceChatScreen from "../marketPlace/marketplace-chat/marketplace-chat-screen";
import { useChat } from "@/hooks/useChat";
import { useMarketplaceChat } from "@/hooks/useMarketplaceChat";
import { MessageCircle, ShoppingBag, ArrowLeft } from "lucide-react";

const ChatMainPage = ({ userId, productRef = null, activeTab = "friends" }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTab, setCurrentTab] = useState(activeTab);

  const router = useRouter();
  const searchParams = useSearchParams();

  const urlProductId = searchParams.get("productId");
  const urlSellerId = searchParams.get("sellerId");

  const {
    selectedFriend,
    currentChat: friendsCurrentChat,
    messages: friendsMessages,
    isSocketConnected: friendsSocketConnected,
    isLoadingMessages: friendsLoadingMessages,
    isLoadingMoreMessages: friendsLoadingMoreMessages,
    hasMoreMessages: friendsHasMoreMessages,
    handleSelectUser,
    handleSendMessage: friendsSendMessage,
    handleStartTyping: friendsStartTyping,
    handleStopTyping: friendsStopTyping,
    handleFetchChats,
    typingUsers: friendsTypingUsers,
    handleGetchatMessages,
    refreshMessages: friendsRefreshMessages,
    loadMoreMessages: friendsLoadMoreMessages,
    socketManager: friendsSocketManager,
    chats: friendsChats,
    unreadCounts: friendsUnreadCounts,
  } = useChat(userId, productRef);

  const {
    selectedChat: marketplaceSelectedChat,
    currentChat: marketplaceCurrentChat,
    messages: marketplaceMessages,
    chats: marketplaceChats,
    isSocketConnected: marketplaceSocketConnected,
    isLoadingMessages: marketplaceLoadingMessages,
    isLoadingMoreMessages: marketplaceLoadingMoreMessages,
    isLoadingChats: marketplaceLoadingChats,
    hasMoreMessages: marketplaceHasMoreMessages,
    hasMoreChats: marketplaceHasMoreChats,
    handleAccessOrCreateChat,
    handleSelectChat: marketplaceSelectChat,
    handleSendMessage: marketplaceSendMessage,
    handleFetchChats: marketplaceFetchChats,
    handleStartTyping: marketplaceStartTyping,
    handleStopTyping: marketplaceStopTyping,
    handleToggleReaction,
    typingUsers: marketplaceTypingUsers,
    loadMoreMessages: marketplaceLoadMoreMessages,
    loadMoreChats: marketplaceLoadMoreChats,
    refreshMessages: marketplaceRefreshMessages,
    socketManager: marketplaceSocketManager,
  } = useMarketplaceChat(urlProductId, urlSellerId);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768 && (selectedFriend || marketplaceSelectedChat)) {
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedFriend, marketplaceSelectedChat]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["friends", "marketplace"].includes(tabFromUrl)) {
      setCurrentTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentTab === "marketplace") {
      marketplaceFetchChats(1, true);
    }
  }, [currentTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tab);

    if (tab === "marketplace" && urlProductId && urlSellerId) {
      newSearchParams.set("productId", urlProductId);
      newSearchParams.set("sellerId", urlSellerId);
    } else if (tab === "friends") {
      newSearchParams.delete("productId");
      newSearchParams.delete("sellerId");
    }

    router.push(`/chat?${newSearchParams.toString()}`, { scroll: false });

    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const handleFriendsUserSelection = (user) => {
    handleSelectUser(user);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleMarketplaceChatSelection = (chat) => {
    marketplaceSelectChat(chat);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const hasSelectedChat =
    currentTab === "friends" ? selectedFriend : marketplaceSelectedChat;

  return (
    <div className="flex h-[calc(100vh-110px)] bg-white rounded-lg overflow-hidden">
      <div
        className={`
          ${showSidebar ? "block" : "hidden"} 
          ${isMobile ? "w-full" : "w-80"} 
          ${isMobile ? "absolute inset-0 z-10" : "relative"}
          border-r border-gray-200 bg-white flex flex-col
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="border-b border-gray-200 bg-gray-50">
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              {hasSelectedChat && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="flex bg-gray-50">
            <button
              onClick={() => handleTabChange("friends")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                transition-all duration-200 border-b-2
                ${
                  currentTab === "friends"
                    ? "text-blue-600 border-blue-600 bg-white"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Friends</span>
            </button>
            <button
              onClick={() => handleTabChange("marketplace")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                transition-all duration-200 border-b-2
                ${
                  currentTab === "marketplace"
                    ? "text-blue-600 border-blue-600 bg-white"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {currentTab === "friends" ? (
            <ChatSidebar
              onSelectUser={handleFriendsUserSelection}
              isMobile={isMobile}
              chats={friendsChats}
              unreadCounts={friendsUnreadCounts}
              selectedFriend={selectedFriend}
            />
          ) : (
            <MarketplaceChatSidebar
              chats={marketplaceChats}
              selectedChat={marketplaceSelectedChat}
              onSelectChat={handleMarketplaceChatSelection}
              isLoading={marketplaceLoadingChats}
              hasMoreChats={marketplaceHasMoreChats}
              onLoadMoreChats={marketplaceLoadMoreChats}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      <div
        className={`
          flex-1 flex flex-col
          ${showSidebar && isMobile ? "hidden" : "flex"}
          ${!showSidebar && isMobile ? "w-full" : ""}
        `}
      >
        {isMobile && hasSelectedChat && !showSidebar && (
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              {currentTab === "friends" ? (
                <div className="font-medium text-gray-900">
                  {selectedFriend?.firstName} {selectedFriend?.lastName}
                </div>
              ) : (
                <div className="font-medium text-gray-900">
                  {marketplaceSelectedChat?.productRef?.name ||
                    "Marketplace Chat"}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {currentTab === "friends" ? (
            <ChatScreen
              selectedFriend={selectedFriend}
              currentChat={friendsCurrentChat}
              messages={friendsMessages}
              isSocketConnected={friendsSocketConnected}
              isLoadingMessages={friendsLoadingMessages}
              isLoadingMoreMessages={friendsLoadingMoreMessages}
              hasMoreMessages={friendsHasMoreMessages}
              onSendMessage={friendsSendMessage}
              onStartTyping={friendsStartTyping}
              onStopTyping={friendsStopTyping}
              typingUsers={friendsTypingUsers}
              onGetChatMessages={handleGetchatMessages}
              refreshMessages={friendsRefreshMessages}
              loadMoreMessages={friendsLoadMoreMessages}
              socketManager={friendsSocketManager}
              isMobile={isMobile}
              onToggleSidebar={toggleSidebar}
              showSidebar={showSidebar}
            />
          ) : (
            <MarketplaceChatScreen
              selectedChat={marketplaceSelectedChat}
              currentChat={marketplaceCurrentChat}
              messages={marketplaceMessages}
              isSocketConnected={marketplaceSocketConnected}
              isLoadingMessages={marketplaceLoadingMessages}
              isLoadingMoreMessages={marketplaceLoadingMoreMessages}
              hasMoreMessages={marketplaceHasMoreMessages}
              onSendMessage={marketplaceSendMessage}
              onStartTyping={marketplaceStartTyping}
              onStopTyping={marketplaceStopTyping}
              onToggleReaction={handleToggleReaction}
              typingUsers={marketplaceTypingUsers}
              onLoadMoreMessages={marketplaceLoadMoreMessages}
              onRefreshMessages={marketplaceRefreshMessages}
              isMobile={isMobile}
              onToggleSidebar={toggleSidebar}
              showSidebar={showSidebar}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMainPage;
