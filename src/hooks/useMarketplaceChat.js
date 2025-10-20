import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "@/contexts/SocketContext";
import {
  accessOrCreateMarketplaceChatApi,
  getMarketplaceChatsApi,
  getMarketplaceChatMessagesApi,
  sendMarketplaceMessageApi,
  markMarketplaceChatMessagesAsReadApi,
  toggleMarketplaceMessageReactionApi,
  deleteMarketplaceMessageApi,
  editMarketplaceMessageApi,
} from "@/app/api/marketplaceChat";

export const useMarketplaceChat = (
  initialProductId = null,
  initialSellerId = null
) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentChatPage, setCurrentChatPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const messagesPerPage = 50;
  const chatsPerPage = 20;

  const initializedChatsRef = useRef(new Set());

  const currentUser = useSelector((state) => state.auth.user);
  const { socketManager, isConnected: isSocketConnected } = useSocketContext();

  useEffect(() => {
    const handleIncomingMessage = (data) => {
      console.log(
        "🛒 Incoming marketplace socket message:",
        data?.message?._id,
        data?.message?.content?.substring(0, 50)
      );
      if (data && data.message && data.chatId === currentChat?._id) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg._id === data.message._id
          );
          if (!messageExists) {
            console.log(
              "✅ Adding new marketplace message to state:",
              data.message._id
            );
            return [...prevMessages, data.message];
          }
          console.log(
            "⏭️ Marketplace message already exists, skipping:",
            data.message._id
          );
          return prevMessages;
        });

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === data.chatId
              ? { ...chat, lastMessage: data.message, updatedAt: new Date() }
              : chat
          )
        );
      }
    };

    const unsubscribeMessage = socketManager.onMarketplaceMessage(
      handleIncomingMessage
    );
    return () => {
      if (typeof unsubscribeMessage === "function") {
        unsubscribeMessage();
      }
    };
  }, [currentChat?._id]);

  useEffect(() => {
    const handleTyping = (data) => {
      if (
        data?.marketplaceChatId === currentChat?._id &&
        data?.userId !== currentUser?.id
      ) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data?.marketplaceChatId === currentChat?._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        setIsTyping((prev) => prev && typingUsers.size > 1);
      }
    };

    const unsubscribeTyping = socketManager.onMarketplaceTyping(handleTyping);
    const unsubscribeStopTyping =
      socketManager.onMarketplaceStopTyping(handleStopTyping);

    return () => {
      if (typeof unsubscribeTyping === "function") {
        unsubscribeTyping();
      }
      if (typeof unsubscribeStopTyping === "function") {
        unsubscribeStopTyping();
      }
    };
  }, [currentChat?._id, currentUser?.id, typingUsers.size]);

  useEffect(() => {
    const loadInitialChat = async () => {
      if (initialProductId && initialSellerId && currentUser) {
        const chatKey = `${initialSellerId}-${initialProductId}`;

        if (initializedChatsRef.current.has(chatKey)) {
          console.log("Chat already initialized for:", chatKey);
          return;
        }

        console.log("Initializing chat for:", chatKey);
        initializedChatsRef.current.add(chatKey);

        try {
          await handleAccessOrCreateChat(initialSellerId, initialProductId);
        } catch (error) {
          console.error("Error loading initial marketplace chat:", error);
          // Remove from tracking on error so it can be retried
          initializedChatsRef.current.delete(chatKey);
        }
      }
    };

    loadInitialChat();
  }, [initialProductId, initialSellerId, currentUser?.id]);

  const handleAccessOrCreateChat = useCallback(
    async (sellerId, productId) => {
      if (!sellerId || !productId) return;

      try {
        setIsLoadingMessages(true);
        const response = await accessOrCreateMarketplaceChatApi(
          sellerId,
          productId
        );

        if (response?.data?.chat) {
          const chat = response.data.chat;
          setCurrentChat(chat);
          setSelectedChat(chat);

          if (socketManager.isSocketConnected()) {
            socketManager.joinMarketplaceChat(chat._id);
          }

          await handleGetChatMessages(chat._id);

          await handleFetchChats();
        }
      } catch (error) {
        console.error("Error accessing marketplace chat:", error);
        throw error;
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [currentUser?.id]
  );

  const handleFetchChats = useCallback(
    async (page = 1, reset = false) => {
      try {
        if (reset) {
          setIsLoadingChats(true);
          setCurrentChatPage(1);
        }

        const response = await getMarketplaceChatsApi(page, chatsPerPage);

        if (response?.data?.chats) {
          if (reset || page === 1) {
            setChats(response.data.chats);
          } else {
            setChats((prevChats) => [...prevChats, ...response.data.chats]);
          }

          setHasMoreChats(response.data.pagination?.hasMore || false);
          setCurrentChatPage(page);
        }
      } catch (error) {
        console.error("Error fetching marketplace chats:", error);
      } finally {
        setIsLoadingChats(false);
      }
    },
    [chatsPerPage]
  );

  const handleGetChatMessages = useCallback(
    async (chatId, page = 1, reset = false) => {
      if (!chatId) return;

      try {
        if (reset) {
          setIsLoadingMessages(true);
          setCurrentPage(1);
          setHasMoreMessages(true);
        }

        const response = await getMarketplaceChatMessagesApi(
          chatId,
          page,
          messagesPerPage
        );

        if (response?.data?.messages) {
          if (reset || page === 1) {
            setMessages(response.data.messages);
          } else {
            setMessages((prevMessages) => [
              ...response.data.messages,
              ...prevMessages,
            ]);
          }

          setHasMoreMessages(response.data.pagination?.hasMore || false);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [messagesPerPage]
  );

  const handleSendMessage = useCallback(
    async (
      content,
      media = null,
      messageType = "text",
      replyTo = null,
      sharedProduct = null,
      offerDetails = null
    ) => {
      if (!currentChat?._id || (!content?.trim() && !media)) return;

      try {
        const response = await sendMarketplaceMessageApi(
          currentChat._id,
          content,
          media,
          messageType,
          replyTo,
          sharedProduct,
          offerDetails
        );

        if (response?.data?.message) {
          console.log(
            "✅ Marketplace message sent successfully:",
            response.data.message._id
          );
          console.log("Socket connected:", socketManager.isSocketConnected());

          setMessages((prevMessages) => {
            const messageExists = prevMessages.some(
              (msg) => msg._id === response.data.message._id
            );
            if (!messageExists) {
              console.log(
                "Adding marketplace message to UI:",
                response.data.message._id
              );
              return [...prevMessages, response.data.message];
            }
            console.log(
              "Marketplace message already exists in UI:",
              response.data.message._id
            );
            return prevMessages;
          });

          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === currentChat._id
                ? {
                    ...chat,
                    lastMessage: response.data.message,
                    updatedAt: new Date(),
                  }
                : chat
            )
          );

          return response.data.message;
        }
      } catch (error) {
        console.error("Error sending marketplace message:", error);
        throw error;
      }
    },
    [currentChat?._id]
  );

  const handleSelectChat = useCallback(
    async (chat) => {
      if (!chat?._id) return;

      try {
        setSelectedChat(chat);
        setCurrentChat(chat);
        setTypingUsers(new Set());
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);

        if (socketManager.isSocketConnected()) {
          if (currentChat?._id) {
            socketManager.leaveMarketplaceChat(currentChat._id);
          }
          socketManager.joinMarketplaceChat(chat._id);
        }

        await handleGetChatMessages(chat._id, 1, true);

        await markMarketplaceChatMessagesAsReadApi(chat._id);
      } catch (error) {
        console.error("Error selecting marketplace chat:", error);
      }
    },
    [currentChat?._id, handleGetChatMessages]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!currentChat || !hasMoreMessages || isLoadingMoreMessages) return;

    try {
      setIsLoadingMoreMessages(true);
      const nextPage = currentPage + 1;

      const response = await getMarketplaceChatMessagesApi(
        currentChat._id,
        nextPage,
        messagesPerPage
      );

      if (response?.data?.messages && response.data.messages.length > 0) {
        setMessages((prevMessages) => [
          ...response.data.messages,
          ...prevMessages,
        ]);
        setCurrentPage(nextPage);
        setHasMoreMessages(response.data.pagination?.hasMore || false);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMoreMessages(false);
    }
  }, [
    currentChat,
    currentPage,
    hasMoreMessages,
    isLoadingMoreMessages,
    messagesPerPage,
  ]);

  const loadMoreChats = useCallback(async () => {
    if (!hasMoreChats || isLoadingChats) return;

    const nextPage = currentChatPage + 1;
    await handleFetchChats(nextPage);
  }, [currentChatPage, hasMoreChats, isLoadingChats, handleFetchChats]);

  const refreshMessages = useCallback(async () => {
    if (currentChat?._id) {
      await handleGetChatMessages(currentChat._id, 1, true);
    }
  }, [currentChat?._id, handleGetChatMessages]);

  const handleStartTyping = useCallback(() => {
    if (currentChat && socketManager.isSocketConnected()) {
      socketManager.startMarketplaceTyping(currentChat._id);
    }
  }, [currentChat]);

  const handleStopTyping = useCallback(() => {
    if (currentChat && socketManager.isSocketConnected()) {
      socketManager.stopMarketplaceTyping(currentChat._id);
    }
  }, [currentChat]);

  const handleToggleReaction = useCallback(async (messageId, emoji) => {
    try {
      const response = await toggleMarketplaceMessageReactionApi(
        messageId,
        emoji
      );

      if (response?.data?.reactions) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId
              ? { ...msg, reactions: response.data.reactions }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  }, []);

  const handleDeleteMessage = useCallback(
    async (messageId, deleteType = "forMe") => {
      try {
        await deleteMarketplaceMessageApi(messageId, deleteType);

        if (deleteType === "forEveryone") {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== messageId)
          );
        } else {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === messageId ? { ...msg, isDeletedForMe: true } : msg
            )
          );
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
      }
    },
    []
  );

  const handleEditMessage = useCallback(async (messageId, newContent) => {
    try {
      const response = await editMarketplaceMessageApi(messageId, newContent);

      if (response?.data?.message) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (currentChat?._id && socketManager.isSocketConnected()) {
      socketManager.leaveMarketplaceChat(currentChat._id);
    }
    setMessages([]);
    setChats([]);
    setTypingUsers(new Set());
    setIsTyping(false);
    setSelectedChat(null);
    setCurrentChat(null);
    // Clear the initialization tracking
    initializedChatsRef.current.clear();
  }, [currentChat?._id]);

  // Function to reset initialization tracking (useful after DB clear)
  const resetInitializationTracking = useCallback(() => {
    initializedChatsRef.current.clear();
    console.log("Reset chat initialization tracking");
  }, []);

  return {
    selectedChat,
    currentChat,
    messages,
    chats,
    isTyping,
    typingUsers: Array.from(typingUsers),
    isSocketConnected,
    currentUser,
    isLoadingMessages,
    isLoadingMoreMessages,
    isLoadingChats,
    hasMoreMessages,
    hasMoreChats,

    handleAccessOrCreateChat,
    handleSelectChat,
    handleSendMessage,
    handleFetchChats,
    handleGetChatMessages,
    loadMoreMessages,
    loadMoreChats,
    refreshMessages,
    handleStartTyping,
    handleStopTyping,
    handleToggleReaction,
    handleDeleteMessage,
    handleEditMessage,
    cleanup,
    resetInitializationTracking,

    socketManager,
  };
};
