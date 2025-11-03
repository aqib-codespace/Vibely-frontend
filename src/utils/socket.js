import { io } from "socket.io-client";
import React from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

console.log("🔌 Socket connecting to:", BACKEND_URL);

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentChatId = null;
    this.currentMarketplaceChatId = null;
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.connectionCallbacks = [];
    this.marketplaceMessageCallbacks = [];
    this.marketplaceTypingCallbacks = [];
    this.notificationCallbacks = [];
    this.currentUser = null;
  }

  initialize(token, user) {
    if (this.socket) {
      this.disconnect();
    }

    this.currentUser = user;
    this.socket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: false,
    });

    this.setupEventListeners();
    this.socket.connect();

    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      console.log("✅ Socket connected successfully to:", BACKEND_URL);
      this.isConnected = true;
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected. Reason:", reason);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error.message);
      console.error("🔍 Make sure backend server is running on:", BACKEND_URL);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on("new message", (message) => {
      console.log("📨 Received new message:", {
        messageId: message._id,
        chatId: message.chat,
        content: message.content?.substring(0, 50) + "...",
        sender: message.sender?.firstName || message.sender?._id,
      });
      this.notifyMessageCallbacks(message);
    });

    this.socket.on("messageReaction", (updatedMessage) => {
      console.log("👍 Received message reaction:", {
        messageId: updatedMessage._id,
        reactions: updatedMessage.reaction?.length || 0,
      });
      this.notifyMessageCallbacks(updatedMessage);
    });

    this.socket.on("typing", ({ chatId, user }) => {
      this.notifyTypingCallbacks({ chatId, user, isTyping: true });
    });

    this.socket.on("stop typing", ({ chatId, user }) => {
      this.notifyTypingCallbacks({ chatId, user, isTyping: false });
    });

    this.socket.on("new marketplace message", (data) => {
      this.notifyMarketplaceMessageCallbacks(data);
    });

    this.socket.on(
      "marketplace typing",
      ({ marketplaceChatId, userId, user }) => {
        this.notifyMarketplaceTypingCallbacks({
          marketplaceChatId,
          userId,
          user,
          isTyping: true,
        });
      }
    );

    this.socket.on(
      "stop marketplace typing",
      ({ marketplaceChatId, userId }) => {
        this.notifyMarketplaceTypingCallbacks({
          marketplaceChatId,
          userId,
          isTyping: false,
        });
      }
    );

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("new_notification", (notification) => {
      console.log("🔔 Received notification via socket:", notification);
      this.notifyNotificationCallbacks(notification);
    });
  }

  joinChat(chatId) {
    console.log("🏠 Attempting to join chat:", {
      chatId,
      isConnected: this.isConnected,
      hasSocket: !!this.socket,
      currentChatId: this.currentChatId,
    });

    if (this.socket && this.isConnected) {
      if (this.currentChatId) {
        console.log("👋 Leaving previous chat:", this.currentChatId);
        this.leaveChat(this.currentChatId);
      }
      this.currentChatId = chatId;
      this.socket.emit("join chat", chatId);
      console.log("✅ Joined chat:", chatId);
    } else {
      console.error("❌ Cannot join chat: Socket not connected");
    }
  }

  leaveChat(chatId = null) {
    const roomToLeave = chatId || this.currentChatId;
    if (this.socket && this.isConnected && roomToLeave) {
      this.socket.emit("leave chat", roomToLeave);
      if (roomToLeave === this.currentChatId) {
        this.currentChatId = null;
      }
    }
  }

  sendMessage(messageData) {
    console.log("📤 Attempting to send message:", {
      isConnected: this.isConnected,
      hasSocket: !!this.socket,
      chatId: messageData.chatId,
      content: messageData.content?.substring(0, 50) + "...",
      sender: this.currentUser?._id,
    });

    if (!this.socket || !this.isConnected) {
      console.error("❌ Cannot send message: Socket not connected");
      return false;
    }

    if (!messageData.chatId || (!messageData.content && !messageData.file)) {
      console.error("❌ Cannot send message: Missing chatId or content/file");
      return false;
    }

    const payload = {
      chatId: messageData.chatId,
      content: messageData.content || "",
      sender: this.currentUser?._id,
      messageData: messageData.messageData,
      ...messageData,
    };

    console.log("🚀 Emitting 'new message' event with payload:", payload);
    this.socket.emit("new message", payload);
    return true;
  }

  startTyping(chatId = null) {
    const targetChatId = chatId || this.currentChatId;
    if (this.socket && this.isConnected && targetChatId) {
      this.socket.emit("typing", {
        chatId: targetChatId,
        user: this.currentUser,
      });
    }
  }

  stopTyping(chatId = null) {
    const targetChatId = chatId || this.currentChatId;
    if (this.socket && this.isConnected && targetChatId) {
      this.socket.emit("stop typing", {
        chatId: targetChatId,
        user: this.currentUser,
      });
    }
  }

  joinMarketplaceChat(marketplaceChatId) {
    if (this.socket && this.isConnected) {
      if (this.currentMarketplaceChatId) {
        this.leaveMarketplaceChat(this.currentMarketplaceChatId);
      }
      this.currentMarketplaceChatId = marketplaceChatId;
      this.socket.emit("join marketplace chat", marketplaceChatId);
    }
  }

  leaveMarketplaceChat(marketplaceChatId = null) {
    const roomToLeave = marketplaceChatId || this.currentMarketplaceChatId;
    if (this.socket && this.isConnected && roomToLeave) {
      this.socket.emit("leave marketplace chat", roomToLeave);
      if (roomToLeave === this.currentMarketplaceChatId) {
        this.currentMarketplaceChatId = null;
      }
    }
  }

  startMarketplaceTyping(marketplaceChatId = null) {
    const targetChatId = marketplaceChatId || this.currentMarketplaceChatId;
    if (this.socket && this.isConnected && targetChatId) {
      this.socket.emit("marketplace typing", targetChatId);
    }
  }

  stopMarketplaceTyping(marketplaceChatId = null) {
    const targetChatId = marketplaceChatId || this.currentMarketplaceChatId;
    if (this.socket && this.isConnected && targetChatId) {
      this.socket.emit("stop marketplace typing", targetChatId);
    }
  }

  onMarketplaceMessage(callback) {
    this.marketplaceMessageCallbacks.push(callback);
    return () => this.offMarketplaceMessage(callback);
  }

  offMarketplaceMessage(callback) {
    this.marketplaceMessageCallbacks = this.marketplaceMessageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  notifyMarketplaceMessageCallbacks(data) {
    this.marketplaceMessageCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in marketplace message callback:", error);
      }
    });
  }

  onMarketplaceTyping(callback) {
    this.marketplaceTypingCallbacks.push(callback);
    return () => this.offMarketplaceTyping(callback);
  }

  onMarketplaceStopTyping(callback) {
    return this.onMarketplaceTyping(callback);
  }

  offMarketplaceTyping(callback) {
    this.marketplaceTypingCallbacks = this.marketplaceTypingCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  notifyMarketplaceTypingCallbacks(data) {
    this.marketplaceTypingCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in marketplace typing callback:", error);
      }
    });
  }

  onMessage(callback) {
    console.log(
      "📝 Registering message callback. Total callbacks:",
      this.messageCallbacks.length
    );
    this.messageCallbacks.push(callback);
    console.log(
      "📝 Message callback registered. New total:",
      this.messageCallbacks.length
    );
    return () => this.offMessage(callback);
  }

  offMessage(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  notifyMessageCallbacks(message) {
    console.log(
      "🔔 Notifying message callbacks. Total callbacks:",
      this.messageCallbacks.length
    );
    this.messageCallbacks.forEach((callback) => {
      try {
        console.log("📞 Calling message callback");
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  }

  onTyping(callback) {
    this.typingCallbacks.push(callback);
    return () => this.offTyping(callback);
  }

  offTyping(callback) {
    this.typingCallbacks = this.typingCallbacks.filter((cb) => cb !== callback);
  }

  notifyTypingCallbacks(data) {
    this.typingCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in typing callback:", error);
      }
    });
  }

  onConnection(callback) {
    this.connectionCallbacks.push(callback);
    return () => this.offConnection(callback);
  }

  offConnection(callback) {
    this.connectionCallbacks = this.connectionCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  notifyConnectionCallbacks(isConnected) {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error("Error in connection callback:", error);
      }
    });
  }

  onNotification(callback) {
    this.notificationCallbacks.push(callback);
    return () => this.offNotification(callback);
  }

  offNotification(callback) {
    this.notificationCallbacks = this.notificationCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  notifyNotificationCallbacks(notification) {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error in notification callback:", error);
      }
    });
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getCurrentChatId() {
    return this.currentChatId;
  }

  getCurrentMarketplaceChatId() {
    return this.currentMarketplaceChatId;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.currentChatId) {
      this.leaveChat(this.currentChatId);
    }

    if (this.currentMarketplaceChatId) {
      this.leaveMarketplaceChat(this.currentMarketplaceChatId);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.currentChatId = null;
    this.currentMarketplaceChatId = null;
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.connectionCallbacks = [];
    this.marketplaceMessageCallbacks = [];
    this.marketplaceTypingCallbacks = [];
    this.notificationCallbacks = [];
  }

  cleanup() {
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.connectionCallbacks = [];
    this.marketplaceMessageCallbacks = [];
    this.marketplaceTypingCallbacks = [];
    this.notificationCallbacks = [];
  }
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = socketManager.onConnection(setIsConnected);
    setIsConnected(socketManager.isSocketConnected());

    return unsubscribe;
  }, []);

  return {
    socket: socketManager,
    isConnected,
    sendMessage: (data) => socketManager.sendMessage(data),
    joinChat: (chatId) => socketManager.joinChat(chatId),
    leaveChat: (chatId) => socketManager.leaveChat(chatId),
    startTyping: (chatId) => socketManager.startTyping(chatId),
    stopTyping: (chatId) => socketManager.stopTyping(chatId),
  };
};

const socketManager = new SocketManager();
export default socketManager;

export { socketManager as socketService, SocketManager };
