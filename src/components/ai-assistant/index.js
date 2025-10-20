"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGeminiResponse } from "@/lib/gemini";
import Image from "next/image";

const commonQuestions = [
  {
    question: "What is Vibely?",
    answer:
      "Vibely is a modern social platform designed for entertainment, chatting, and shopping. It allows you to connect with friends, share content, watch videos, and discover products in our marketplace.",
  },
  {
    question: "How does the marketplace work?",
    answer:
      "The Vibely marketplace allows users to browse, buy, and sell products. You can explore various categories, view detailed product information, and make secure transactions.",
  },
  {
    question: "Can I chat with other users?",
    answer:
      "Yes! Vibely offers a robust chat feature that lets you connect with friends and other users. You can send text messages, share media, and create group conversations.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Creating a Vibely account is easy! Click on the Sign Up button, enter your email, create a password, and follow the verification steps. Once verified, you can set up your profile and start exploring the platform.",
  },
  {
    question: "Is Vibely free to use?",
    answer:
      "Yes, Vibely is completely free to use for basic features including social networking, chatting, and content sharing. Some premium features or marketplace transactions may involve fees, but the core experience is free.",
  },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hi there! I'm your Vibely assistant. How can I help you today? Feel free to ask me about Vibely features, the marketplace, or how to get started!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef(null);

  const toggleChat = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setIsDragging(true);
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonSize = 70;

    const constrainedX = Math.max(0, Math.min(windowWidth - buttonSize, newX));
    const constrainedY = Math.max(0, Math.min(windowHeight - buttonSize, newY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleTouchStart = (e) => {
    setIsDragging(false);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonSize = 70;

    const constrainedX = Math.max(0, Math.min(windowWidth - buttonSize, newX));
    const constrainedY = Math.max(0, Math.min(windowHeight - buttonSize, newY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleTouchEnd = () => {
    document.removeEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.removeEventListener("touchend", handleTouchEnd);
    setTimeout(() => setIsDragging(false), 100);
  };

  const getChatPanelPosition = () => {
    if (!isMounted || typeof window === "undefined") {
      return { left: "24px", top: "24px" };
    }

    const chatWidth = 384;
    const chatHeight = window.innerHeight * 0.8;
    const padding = 10;

    let left, top;

    if (position.x > window.innerWidth / 2) {
      left = Math.max(padding, position.x - chatWidth);
    } else {
      left = Math.min(window.innerWidth - chatWidth - padding, position.x + 80);
    }

    if (position.y > window.innerHeight / 2) {
      top = Math.max(padding, position.y - chatHeight);
    } else {
      top = Math.min(window.innerHeight - chatHeight - padding, position.y);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("ai-assistant-position");
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition);
          const maxX = window.innerWidth - 70;
          const maxY = window.innerHeight - 70;
          if (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
            setPosition({ x, y });
            return;
          }
        } catch (error) {
          console.log("Failed to parse saved position");
        }
      }

      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      });
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      localStorage.setItem("ai-assistant-position", JSON.stringify(position));
    }
  }, [position, isMounted]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: messages.length + 1,
        type: "user",
        text: inputValue.trim(),
      };

      setMessages([...messages, userMessage]);
      const userQuestion = inputValue.trim();
      setInputValue("");
      const tempLoadingId = messages.length + 2;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: tempLoadingId,
          type: "bot",
          text: "...",
          isLoading: true,
        },
      ]);

      try {
        const lowerCaseInput = userQuestion.toLowerCase();
        let matchingQuestion = null;

        matchingQuestion = commonQuestions.find(
          (q) => lowerCaseInput === q.question.toLowerCase()
        );
        if (!matchingQuestion) {
          matchingQuestion = commonQuestions.find(
            (q) =>
              lowerCaseInput.includes(q.question.toLowerCase()) ||
              q.question.toLowerCase().includes(lowerCaseInput)
          );
        }

        let responseText;

        if (matchingQuestion) {
          responseText = matchingQuestion.answer;

          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          try {
            responseText = await generateGeminiResponse(userQuestion);
          } catch (apiError) {
            console.error("Gemini API error:", apiError);
            responseText =
              "I'm here to help with questions about Vibely! You can ask me about how to use the platform, create an account, or explore features like the marketplace and chat.";
          }
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempLoadingId
              ? { id: tempLoadingId, type: "bot", text: responseText }
              : msg
          )
        );
      } catch (error) {
        console.error("Error generating response:", error);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempLoadingId
              ? {
                  id: tempLoadingId,
                  type: "bot",
                  text: "I'm here to help with questions about Vibely! Feel free to ask about features, account creation, or how to use the platform.",
                }
              : msg
          )
        );
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <div
        ref={buttonRef}
        className={cn(
          "fixed z-[999] text-xs text-gray-600 bg-gray-900 backdrop-blur-md rounded-full p-3 shadow-md select-none transition-all duration-200",
          isDragging
            ? "cursor-grabbing scale-110"
            : "cursor-grab hover:scale-105"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isOpen
            ? "scale(0)"
            : isDragging
            ? "scale(1.1)"
            : "scale(1)",
          opacity: isOpen ? 0 : 1,
          transition: isOpen
            ? "all 0.3s ease"
            : isDragging
            ? "none"
            : "all 0.2s ease",
          boxShadow: isDragging
            ? "0 8px 25px rgba(0, 0, 0, 0.3)"
            : "0 4px 14px 0 rgba(0, 0, 255, 0.39)",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <button
          onClick={toggleChat}
          className={cn(
            "z-[999] flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 shadow-lg text-white transition-all duration-300 focus:outline-none pointer-events-auto",
            !isDragging && "hover:scale-110"
          )}
          style={{
            boxShadow: "0 4px 14px 0 rgba(0, 0, 255, 0.39)",
          }}
          aria-label="Open AI Assistant"
        >
          <img
            src="/ai.png"
            alt="Vibely Assistant"
            width={50}
            height={50}
            className={cn(
              "h-12 w-12 pointer-events-none transition-transform duration-200",
              isDragging && "scale-95"
            )}
            draggable={false}
          />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[999999] w-[80%] mx-auto sm:w-96 sm:h-[80vh] h-[60vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
            style={getChatPanelPosition()}
          >
            <div className="flex items-center justify-between px-4 bg-gray-800  text-white">
              <div className="flex items-center">
                <Image
                  src="/ai.png"
                  alt="Vibely Assistant"
                  width={50}
                  height={20}
                  className="h-16 w-16"
                />
                <h3 className="font-semibold text-2xl text-white">
                  Vibely Assistant
                </h3>
              </div>
              <button
                onClick={toggleChat}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close AI Assistant"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-3 max-w-[85%] p-3 rounded-lg",
                    message.type === "user"
                      ? "ml-auto bg-gray-200 text-gray-900 shadow-sm rounded-br-none"
                      : "mr-auto bg-white shadow-sm border border-gray-100 rounded-bl-none"
                  )}
                >
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-2 border-t border-gray-100 bg-white overflow-x-auto custom-scrollbar whitespace-nowrap">
              {commonQuestions.slice(0, 5).map((q, idx) => (
                <button
                  key={idx}
                  className="inline-block mr-2 px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap transition-colors"
                  onClick={() => {
                    setInputValue(q.question);
                    handleSendMessage();
                  }}
                >
                  {q.question}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Vibely..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
