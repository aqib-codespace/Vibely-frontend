import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "@/contexts/SocketContext";
import {
  createSingleChatApi,
  fetchUserChatsApi,
  getChatMessagesApi,
  sendChatMessageApi,
} from "@/app/api/chat";
import { getUserByIdApi } from "@/app/api/userApis";

export const useChat = (initialUserId = null, productRef = null) => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [chats, setChats] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesPerPage = 20;

  const currentUser = useSelector((state) => state.auth.user);
  const { socketManager, isConnected: isSocketConnected } = useSocketContext();

  useEffect(() => {
    const loadInitialChats = async () => {
      if (!currentUser?._id) return;

      try {
        const response = await fetchUserChatsApi();
        if (response?.chats) {
          const chatMap = {};
          response.chats.forEach((chat) => {
            const otherUser = chat.users.find((u) => u._id !== currentUser._id);
            if (otherUser && chat.latestMessage) {
              chatMap[otherUser._id] = {
                lastMessage: chat.latestMessage,
                updatedAt: chat.latestMessage.createdAt,
              };
            }
          });
          setChats(chatMap);
        }
      } catch (error) {
        console.error("Error loading initial chats:", error);
      }
    };

    loadInitialChats();
  }, [currentUser?._id]);

  useEffect(() => {
    const handleIncomingMessage = (message) => {
      console.log("📨 Incoming socket message:", message?._id);

      // Skip messages sent by current user to avoid duplicates
      if (message?.sender?._id === currentUser?._id) {
        console.log("⏭️ Skipping own message from socket:", message._id);
        return;
      }

      if (message) {
        // Handle message reactions (only if this is a reaction update, not a new message)
        // Check if this message already exists in our messages (meaning it's a reaction update)
        const existingMessage = messages.find((msg) => msg._id === message._id);
        if (existingMessage && message.reaction !== undefined) {
          console.log("👍 Updating message reactions:", message._id);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === message._id
                ? { ...msg, reaction: message.reaction }
                : msg
            )
          );
          return;
        }

        let friendId;
        if (message.sender?._id === currentUser?._id) {
          friendId = selectedFriend?._id;
        } else {
          friendId = message.sender?._id;
        }

        if (friendId) {
          setChats((prev) => ({
            ...prev,
            [friendId]: {
              lastMessage: message,
              updatedAt: message.createdAt || new Date().toISOString(),
            },
          }));

          if (
            message.sender?._id !== currentUser?._id &&
            message.chat !== currentChat?._id
          ) {
            setUnreadCounts((prev) => ({
              ...prev,
              [friendId]: (prev[friendId] || 0) + 1,
            }));
          }
        }

        const messageChatId =
          message.chat?._id || message.chat || message.chatId;
        const currentChatIdToCompare = currentChat?._id;

        if (messageChatId === currentChatIdToCompare) {
          setMessages((prevMessages) => {
            const messageExists = prevMessages.some(
              (msg) => msg._id === message._id
            );
            if (!messageExists) {
              console.log("✅ Adding new message:", message._id);
              return [...prevMessages, message];
            } else {
              console.log("⏭️ Duplicate message skipped:", message._id);
              return prevMessages;
            }
          });
        } else {
          console.log("❌ Message not for current chat:", {
            messageChatId,
            currentChatIdToCompare,
            messageObject: message,
          });
        }
      }
    };

    const handleMessageEdit = (editedMessage) => {
      if (editedMessage && editedMessage.chat === currentChat?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editedMessage._id ? editedMessage : msg
          )
        );

        // Update chats state with edited message
        let friendId;
        if (editedMessage.sender?._id === currentUser?._id) {
          friendId = selectedFriend?._id;
        } else {
          friendId = editedMessage.sender?._id;
        }

        if (friendId) {
          setChats((prev) => ({
            ...prev,
            [friendId]: {
              lastMessage: editedMessage,
              updatedAt: editedMessage.updatedAt || new Date().toISOString(),
            },
          }));
        }
      }
    };

    const unsubscribeMessage = socketManager.onMessage(handleIncomingMessage);
    const unsubscribeEdit = socketManager.onMessageEdit
      ? socketManager.onMessageEdit(handleMessageEdit)
      : () => {};

    return () => {
      if (typeof unsubscribeMessage === "function") {
        unsubscribeMessage();
      }
      if (typeof unsubscribeEdit === "function") {
        unsubscribeEdit();
      }
    };
  }, [currentChat?._id, currentUser?._id]);

  useEffect(() => {
    const loadInitialChat = async () => {
      if (initialUserId && currentUser && !selectedFriend) {
        try {
          const userResponse = await getUserByIdApi(initialUserId);
          if (userResponse?.data) {
            await handleSelectUser(userResponse.data);
          }
        } catch (error) {
          console.error("Error loading initial chat user:", error);
        }
      }
    };

    loadInitialChat();
  }, [initialUserId, currentUser?.id]);

  const handleSelectUser = useCallback(
    async (friend) => {
      if (!friend?._id) return;

      try {
        setSelectedFriend(friend);
        setTypingUsers(new Set());
        setIsLoadingMessages(true);
        setCurrentPage(1);
        setHasMoreMessages(true);
        setMessages([]);

        // Clear unread count for this friend
        setUnreadCounts((prev) => ({
          ...prev,
          [friend._id]: 0,
        }));

        const chatsResponse = await fetchUserChatsApi();
        if (chatsResponse?.chats) {
          const existingChat = chatsResponse.chats.find((chat) =>
            chat.users.some((user) => user._id === friend._id)
          );

          if (existingChat) {
            setCurrentChat(existingChat);

            const messagesResponse = await getChatMessagesApi(
              existingChat._id,
              1,
              messagesPerPage
            );

            if (messagesResponse?.data) {
              setMessages(messagesResponse.data);
              setHasMoreMessages(messagesResponse.pagination?.hasMore || false);
            }

            if (socketManager.isSocketConnected()) {
              socketManager.joinChat(existingChat._id);
            }
          } else {
            setCurrentChat(null);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Error selecting user:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [messagesPerPage]
  );

  const handleSendMessage = useCallback(
    async (content, file = null, replyTo = null, productData = null) => {
      if (!selectedFriend) {
        console.error("No friend selected");
        return false;
      }

      if (!content?.trim() && !file) {
        console.error("No content to send");
        return false;
      }

      if (!currentUser) {
        console.error("User not authenticated");
        return false;
      }

      try {
        let chatToUse = currentChat;

        if (!chatToUse) {
          const response = await createSingleChatApi(selectedFriend._id);
          if (!response?.chat) {
            throw new Error("Failed to create chat");
          }
          chatToUse = response.chat;
          setCurrentChat(chatToUse);

          if (socketManager.isSocketConnected()) {
            socketManager.joinChat(chatToUse._id);
          }
        }

        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticMessage = {
          _id: tempId,
          content: content?.trim() || "",
          sender: {
            _id: currentUser._id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            profilePicture: currentUser.profilePicture,
          },
          chat: chatToUse._id,
          createdAt: new Date().toISOString(),
          media: file
            ? { name: file.name, type: file.type, size: file.size }
            : null,
          replyTo: replyTo,
          productData: productData,
          isOptimistic: true,
          isSending: true,
        };

        console.log(
          "Created optimistic message with productData:",
          optimisticMessage.productData
        );

        setMessages((prev) => [...prev, optimisticMessage]);

        console.log("Sending message with product data to API:", productData);

        const response = await sendChatMessageApi(
          chatToUse._id,
          content?.trim() || "",
          file,
          replyTo,
          productData
        );

        if (response?.data) {
          const savedMessage = {
            _id: response.data._id,
            content: response.data.content,
            sender: optimisticMessage.sender,
            chat: chatToUse._id,
            createdAt: response.data.createdAt,
            media: response.data.media,
            replyTo: response.data.replyTo,
            productData: response.data.productData || productData,
          };

          console.log(
            "Backend response productData:",
            response.data.productData
          );
          console.log(
            "Final saved message productData:",
            savedMessage.productData
          );

          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempId ? savedMessage : msg))
          );

          // Send via socket for real-time updates
          if (socketManager.isSocketConnected()) {
            console.log(
              "🚀 Sending message via socket for real-time updates:",
              {
                chatId: chatToUse._id,
                messageId: savedMessage._id,
                content: savedMessage.content,
              }
            );

            const socketSuccess = socketManager.sendMessage({
              chatId: chatToUse._id,
              content: savedMessage.content,
              sender: currentUser._id,
              messageData: savedMessage,
            });

            if (!socketSuccess) {
              console.error("❌ Failed to send message via socket");
            }
          } else {
            console.warn("⚠️ Socket not connected, message won't be real-time");
          }

          // Update chats state with new message
          if (selectedFriend?._id) {
            setChats((prev) => ({
              ...prev,
              [selectedFriend._id]: {
                lastMessage: savedMessage,
                updatedAt: savedMessage.createdAt,
              },
            }));
          }

          return true;
        } else {
          throw new Error("Invalid server response");
        }
      } catch (error) {
        console.error("Failed to send message:", error);

        setMessages((prev) => prev.filter((msg) => !msg.isOptimistic));

        return false;
      }
    },
    [currentChat, currentUser, selectedFriend]
  );

  const handleGetchatMessages = useCallback(async (chatId) => {
    if (!chatId) return [];

    try {
      const response = await getChatMessagesApi(chatId);
      if (response?.data) {
        setMessages(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    if (currentChat?._id) {
      try {
        setIsLoadingMessages(true);
        await handleGetchatMessages(currentChat._id);
      } catch (error) {
        console.error("Error refreshing messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }
  }, [currentChat?._id, handleGetchatMessages]);

  const handleFetchChats = useCallback(async () => {
    try {
      const response = await fetchUserChatsApi();
      return response?.chats || [];
    } catch (error) {
      console.error("Error fetching user chats:", error);
      return [];
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!currentChat || isLoadingMoreMessages || !hasMoreMessages) return;

    try {
      setIsLoadingMoreMessages(true);
      const nextPage = currentPage + 1;

      const response = await getChatMessagesApi(
        currentChat._id,
        nextPage,
        messagesPerPage
      );

      if (response?.data && response.data.length > 0) {
        setMessages((prevMessages) => [...response.data, ...prevMessages]);
        setCurrentPage(nextPage);
        setHasMoreMessages(response.pagination?.hasMore || false);
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

  const handleStartTyping = useCallback(() => {
    if (currentChat && socketManager.isSocketConnected()) {
      socketManager.startTyping(currentChat._id);
    }
  }, [currentChat]);

  const handleStopTyping = useCallback(() => {
    if (currentChat && socketManager.isSocketConnected()) {
      socketManager.stopTyping(currentChat._id);
    }
  }, [currentChat]);

  const cleanup = useCallback(() => {
    // Don't clear all callbacks - just reset local state
    setMessages([]);
    setTypingUsers(new Set());
    setIsTyping(false);
  }, []);

  return {
    selectedFriend,
    currentChat,
    messages,
    isTyping,
    typingUsers: Array.from(typingUsers),
    isSocketConnected,
    currentUser,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    handleSelectUser,
    handleSendMessage,
    handleFetchChats,
    cleanup,
    handleGetchatMessages,
    refreshMessages,
    socketManager,
    loadMoreMessages,
    handleStartTyping,
    handleStopTyping,
    productRef,
    chats,
    unreadCounts,
  };
};
