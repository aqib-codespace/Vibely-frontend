"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socketManager from "@/utils/socket";

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (
      token &&
      currentUser &&
      isAuthenticated &&
      !socketManager.isSocketConnected()
    ) {
      console.log("Initializing socket for user:", currentUser.firstName);
      socketManager.initialize(token, currentUser);
    }

    const unsubscribeConnection = socketManager.onConnection((connected) => {
      console.log("Socket connection status:", connected);
      setIsConnected(connected);
    });

    return () => {
      unsubscribeConnection();
    };
  }, [currentUser?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && socketManager.isSocketConnected()) {
      console.log("User logged out, disconnecting socket");
      socketManager.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated]);

  const value = {
    socketManager,
    isConnected,
    sendMessage: (data) => socketManager.sendMessage(data),
    joinChat: (chatId) => socketManager.joinChat(chatId),
    leaveChat: (chatId) => socketManager.leaveChat(chatId),
    startTyping: (chatId) => socketManager.startTyping(chatId),
    stopTyping: (chatId) => socketManager.stopTyping(chatId),

    joinMarketplaceChat: (chatId) => socketManager.joinMarketplaceChat(chatId),
    leaveMarketplaceChat: (chatId) =>
      socketManager.leaveMarketplaceChat(chatId),
    startMarketplaceTyping: (chatId) =>
      socketManager.startMarketplaceTyping(chatId),
    stopMarketplaceTyping: (chatId) =>
      socketManager.stopMarketplaceTyping(chatId),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
