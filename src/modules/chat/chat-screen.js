"use client";
import { SmileIcon, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { fetchProductById } from "@/app/api/marketPlace";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  IoIosArrowDown,
  IoIosAttach,
  IoIosRefresh,
  IoIosSend,
  IoMdClose,
} from "react-icons/io";
import { FcEditImage } from "react-icons/fc";

import { HiArrowUturnLeft, HiArrowUturnRight } from "react-icons/hi2";

import { IoMicOutline } from "react-icons/io5";
import { IoMdMic } from "react-icons/io";
import {
  MdDeleteOutline,
  MdEmojiEmotions,
  MdFileCopy,
  MdOutlineEdit,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdOutlineLogout,
  MdOutlinePermMedia,
} from "react-icons/md";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { TbMessages } from "react-icons/tb";
import { FiSearch, FiShare2, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { ActionIcon, Avatar, Dropdown } from "rizzui";
import DeleteConfirmation from "./delete-model";
import EditMessage from "./edit-message";
import MediaGallery from "./media-gallery";
import {
  deleteAllMessagesInChatApi,
  deleteChatMessageApi,
  deleteMessageForEveryoneApi,
  deleteMessageForMeApi,
  editChatMessageApi,
  getChatWallpaperApi,
  reactToMessageApi,
  removeChatWallpaperApi,
  setChatWallpaperApi,
  searchMessagesApi,
} from "@/app/api/chat";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { FaArrowLeft } from "react-icons/fa6";
import WallpaperUploader from "./chat-walpaper";
import WallpaperSelector from "./chat-walpaper";
import { BiCheckDouble } from "react-icons/bi";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const ReactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥", "👎"];

const ChatScreen = ({
  selectedFriend,
  currentChat,
  messages = [],
  onSendMessage,
  onStartTyping,
  onStopTyping,
  typingUsers = [],
  isSocketConnected = false,
  isLoadingMessages = false,
  isLoadingMoreMessages = false,
  hasMoreMessages = false,
  refreshMessages,
  loadMoreMessages,
  socketManager,
  initialProduct = null,
  isMobile = false,
  isTablet = false,
  onBackClick,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMessageData, setEditMessageData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [clearChatLoading, setClearChatLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMediaPreview, setSelectedMediaPreview] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [lastSpeechTimestamp, setLastSpeechTimestamp] = useState(0);
  const silenceTimerRef = useRef(null);
  const [previewBackground, setPreviewBackground] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [chatWallpaper, setChatWallpaper] = useState(null);
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [productPrefilled, setProductPrefilled] = useState(false);
  const [productReply, setProductReply] = useState(null);
  const [productReplyLoading, setProductReplyLoading] = useState(false);
  const [showProductReply, setShowProductReply] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null); // Track which message is selected on mobile

  const route = useRouter();
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const topLoaderRef = useRef(null);

  // Infinite scroll implementation - load more messages when user scrolls near top
  useEffect(() => {
    if (!hasMoreMessages || isLoadingMoreMessages || !loadMoreMessages) return;

    const loader = topLoaderRef.current;
    if (!loader) return;

    const handleIntersect = (entries) => {
      if (
        entries[0].isIntersecting &&
        hasMoreMessages &&
        !isLoadingMoreMessages
      ) {
        console.log("🔄 Auto-loading more messages via infinite scroll");
        loadMoreMessages();
      }
    };

    const chatContainer = document.getElementById("chat-messages-container");

    const observer = new IntersectionObserver(handleIntersect, {
      root: chatContainer || null,
      rootMargin: "100px 0px", // Start loading 100px before the element comes into view
      threshold: 0.1,
    });

    observer.observe(loader);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreMessages, isLoadingMoreMessages, loadMoreMessages]);

  useEffect(() => {
    const dismissedKey =
      initialProduct?.id && selectedFriend?._id
        ? `productReplyDismissed_${initialProduct.id}_${selectedFriend._id}`
        : null;

    console.log("Product display check:", {
      hasInitialProduct: !!initialProduct,
      productId: initialProduct?.id,
      hasSelectedFriend: !!selectedFriend,
      friendId: selectedFriend?._id,
      dismissedKey,
    });

    if (initialProduct && initialProduct.id && selectedFriend) {
      if (dismissedKey) {
        sessionStorage.removeItem(dismissedKey);
        console.log("Cleared dismissal state for product:", dismissedKey);
      }

      console.log("Showing product reply for product:", initialProduct.id);
      setProductReplyLoading(true);
      setShowProductReply(true);
      fetchProductById(initialProduct.id)
        .then((res) => {
          console.log("Fetched product data:", res?.item);
          setProductReply(res?.item || null);
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
          setProductReply(null);
        })
        .finally(() => setProductReplyLoading(false));
    } else {
      console.log("Not showing product reply - missing requirements");
      setShowProductReply(false);
      setProductReply(null);
    }
  }, [initialProduct, selectedFriend]);
  const handleDismissProductReply = () => {
    if (initialProduct?.id && selectedFriend?._id) {
      const dismissedKey = `productReplyDismissed_${initialProduct.id}_${selectedFriend._id}`;
      sessionStorage.setItem(dismissedKey, "1");
      console.log("Product reply dismissed by user:", dismissedKey);
    }
    setShowProductReply(false);
  };

  useEffect(() => {
    if (!initialProduct) {
      setShowProductReply(false);
      setProductReply(null);
      setProductReplyLoading(false);
    }
  }, [initialProduct]);
  const startSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      if (isListening && Date.now() - lastSpeechTimestamp > 1000) {
        if (recognition) {
          recognition.stop();
        }
      }
    }, 1000);
  };

  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  useEffect(() => {
    const scrollToId = sessionStorage.getItem("scrollToMessageId");
    console.log("Attempting to scroll to message ID:", scrollToId);

    if (scrollToId) {
      sessionStorage.removeItem("scrollToMessageId");
      setHighlightedMessageId(scrollToId);

      const timer = setTimeout(() => {
        const messageElement = document.querySelector(
          `[data-message-id="${scrollToId}"]`
        );

        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          messageElement.classList.add("message-highlight");

          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 1000);
        } else {
          console.log("Message element not found, retrying...");
          const retryTimer = setTimeout(() => {
            const retryElement = document.querySelector(
              `[data-message-id="${scrollToId}"]`
            );
            if (retryElement) {
              retryElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              retryElement.classList.add("message-highlight");
            }
          }, 1000);
          return () => clearTimeout(retryTimer);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [currentChat?._id, messages.length]);

  useEffect(() => {
    if (!highlightedMessageId) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, highlightedMessageId]);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setMessage(transcript);
        setLastSpeechTimestamp(Date.now());
        startSilenceTimer();
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognitionInstance.onspeechstart = () => {
        setLastSpeechTimestamp(Date.now());
        startSilenceTimer();
      };

      recognitionInstance.onspeechend = () => {
        startSilenceTimer();
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    let cancelled = false;
    const handler = setTimeout(async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        setCurrentSearchIndex(0);
        return;
      }
      setIsSearching(true);

      if (currentChat && currentChat._id) {
        try {
          const resp = await searchMessagesApi(currentChat._id, q, 1, 100);
          if (cancelled) return;
          const data = resp?.data ?? resp?.results ?? resp;
          setSearchResults(Array.isArray(data) ? data : []);
          setCurrentSearchIndex(0);
          setIsSearching(false);
          return;
        } catch (err) {
          console.error(
            "Search API failed, falling back to client filter",
            err
          );
        }
      }

      const results = messages.filter((msg) => {
        const content = msg.content || msg.text || "";
        return content.toLowerCase().includes(q.toLowerCase());
      });
      if (!cancelled) {
        setSearchResults(results);
        setCurrentSearchIndex(0);
        setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [searchQuery, messages]);

  useEffect(() => {
    const processedReactions = {};

    messages.forEach((msg) => {
      if (msg.reaction && msg.reaction.length > 0) {
        const messageId = msg._id || msg.id;
        processedReactions[messageId] = {};

        msg.reaction.forEach((reactionItem) => {
          const { emoji, users } = reactionItem;

          if (processedReactions[messageId][emoji]) {
            const existingUsers = processedReactions[messageId][emoji].users;
            const newUsers = users || [];
            const mergedUsers = [...new Set([...existingUsers, ...newUsers])];
            processedReactions[messageId][emoji] = {
              users: mergedUsers,
              count: mergedUsers.length,
            };
          } else {
            processedReactions[messageId][emoji] = {
              users: users || [],
              count: users ? users.length : 0,
            };
          }
        });
      }
    });

    setMessageReactions(processedReactions);
  }, [messages]);

  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (e) => {
      if (selectedMessageId) {
        const messageElement = e.target.closest("[data-message-id]");
        if (
          !messageElement ||
          messageElement.getAttribute("data-message-id") !== selectedMessageId
        ) {
          setSelectedMessageId(null);
          setShowPicker(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobile, selectedMessageId]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && onStartTyping) {
      onStartTyping();

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 3000);

      setTypingTimeout(timeout);
    } else if (!value.trim() && onStopTyping) {
      onStopTyping();
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else {
      recognition.start();
      setIsListening(true);
      setLastSpeechTimestamp(Date.now());
      startSilenceTimer();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !onSendMessage) return;

    if (onStopTyping) {
      onStopTyping();
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const replyToMessageId = replyToMessage
      ? replyToMessage._id || replyToMessage.id
      : null;

    const includeProductData = showProductReply && productReply;
    const productDataToSend = includeProductData
      ? {
          id: productReply._id,
          name: productReply.name,
          price: productReply.price,
          description: productReply.description,
          images: productReply.images,
          category: productReply.category,
        }
      : null;

    if (!currentChat) {
      toast
        .promise(
          onSendMessage(
            message.trim(),
            selectedFile,
            replyToMessageId,
            productDataToSend
          ),
          {
            loading: "Creating chat...",
            success: "",
            error: "Failed to create chat",
          }
        )
        .then((success) => {
          if (success) {
            setMessage("");
            setSelectedFile(null);
            setReplyToMessage(null);
            if (includeProductData) {
              setShowProductReply(false);
              if (initialProduct?.id && selectedFriend?._id) {
                const dismissedKey = `productReplyDismissed_${initialProduct.id}_${selectedFriend._id}`;
                sessionStorage.setItem(dismissedKey, "1");
                console.log(
                  "Product reply dismissed after sending message:",
                  dismissedKey
                );
              }
            }
          }
        });
    } else {
      const success = await onSendMessage(
        message.trim(),
        selectedFile,
        replyToMessageId,
        productDataToSend
      );
      if (success) {
        setMessage("");
        setSelectedFile(null);
        setReplyToMessage(null);
        if (includeProductData) {
          setShowProductReply(false);
          // Mark product as dismissed in sessionStorage
          if (initialProduct?.id && selectedFriend?._id) {
            const dismissedKey = `productReplyDismissed_${initialProduct.id}_${selectedFriend._id}`;
            sessionStorage.setItem(dismissedKey, "1");
            console.log(
              "Product reply dismissed after sending message (existing chat):",
              dismissedKey
            );
          }
        }
      }
    }
  };

  const handleEmojiReaction = async (messageId, emoji) => {
    const currentUserId = currentUser?._id;
    if (!currentUserId) return;

    setMessageReactions((prev) => {
      const updated = { ...prev };
      const messageReactions = { ...updated[messageId] } || {};

      let previousEmoji = null;
      Object.keys(messageReactions).forEach((existingEmoji) => {
        if (messageReactions[existingEmoji].users.includes(currentUserId)) {
          previousEmoji = existingEmoji;
        }
      });

      if (previousEmoji) {
        const updatedUsers = messageReactions[previousEmoji].users.filter(
          (id) => id !== currentUserId
        );
        if (updatedUsers.length === 0) {
          delete messageReactions[previousEmoji];
        } else {
          messageReactions[previousEmoji] = {
            users: updatedUsers,
            count: updatedUsers.length,
          };
        }
      }

      if (previousEmoji !== emoji) {
        if (!messageReactions[emoji]) {
          messageReactions[emoji] = { users: [], count: 0 };
        }
        if (!messageReactions[emoji].users.includes(currentUserId)) {
          messageReactions[emoji].users.push(currentUserId);
          messageReactions[emoji].count = messageReactions[emoji].users.length;
        }
      }
      if (Object.keys(messageReactions).length === 0) {
        delete updated[messageId];
      } else {
        updated[messageId] = messageReactions;
      }

      return updated;
    });

    try {
      await reactToMessageApi(messageId, emoji);
    } catch (error) {
      console.error("Error reacting to message:", error);
      toast.error("Failed to add reaction");
  
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <div className="flex justify-start mb-2">
        <div className="flex items-end gap-2">
          <Avatar
            src={selectedFriend.profilePicture?.url || "/avatar.webp"}
            name={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
            className="h-8 w-8"
          />
          <div className="bg-gray-50 border rounded-2xl rounded-bl-none px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 50MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/avi",
        "video/x-msvideo",
        "audio/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/x-wav",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "File type not supported. Please select an image, video, or audio file."
        );
        return;
      }

      setSelectedFile(file);
    }
  };

  const getFilePreview = (file) => {
    if (!file) return null;

    const fileType = file.type;
    const fileName = file.name;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    if (fileType.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      return (
        <div className="relative">
          <img
            src={imageUrl}
            alt={fileName}
            className="max-w-64 max-h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() =>
              setSelectedMediaPreview({
                type: "image",
                url: imageUrl,
                name: fileName,
                fileData: file,
                sender: currentUser,
                isUserMessage: true,
              })
            }
            onLoad={() => {}}
          />
        </div>
      );
    } else if (fileType.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      return (
        <div className="relative">
          <video
            src={videoUrl}
            className="max-w-48 max-h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() =>
              setSelectedMediaPreview({
                type: "video",
                url: videoUrl,
                name: fileName,
                fileData: file,
                sender: currentUser,
                isUserMessage: true,
              })
            }
            onLoadedData={() => {}}
          />
        </div>
      );
    } else if (fileType.startsWith("audio/")) {
      const audioUrl = URL.createObjectURL(file);
      return (
        <div
          className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg max-w-48 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() =>
            setSelectedMediaPreview({
              type: "audio",
              url: audioUrl,
              name: fileName,
              fileData: file,
              sender: currentUser,
              isUserMessage: true,
            })
          }
        >
          <div className="flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">Audio • {fileSize} MB</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg max-w-48">
          <div className="flex-shrink-0">
            <MdFileCopy className="h-6 w-6 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">Document • {fileSize} MB</p>
          </div>
        </div>
      );
    }
  };

  const renderMessageMedia = (fileData) => {
    if (!fileData) return null;

    const { name, type, url } = fileData;

    let mediaUrl = url;
    if (!mediaUrl && fileData instanceof File) {
      mediaUrl = URL.createObjectURL(fileData);
    }

    const getFileTypeFromUrl = (url) => {
      if (!url) return null;
      const extension = url.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
          return "image";
        case "mp4":
        case "avi":
        case "mov":
        case "webm":
          return "video";
        case "mp3":
        case "wav":
        case "ogg":
          return "audio";
        default:
          return null;
      }
    };

    const urlBasedType = getFileTypeFromUrl(mediaUrl);
    const isImage =
      urlBasedType === "image" ||
      type === "image" ||
      (type && type.startsWith("image/"));
    const isVideo =
      urlBasedType === "video" ||
      type === "video" ||
      (type && type.startsWith("video/"));
    const isAudio =
      urlBasedType === "audio" ||
      type === "audio" ||
      (type && type.startsWith("audio/"));

    if (isImage) {
      return (
        <div className="mb-2 max-w-full">
          <img
            src={mediaUrl}
            alt={name || "Image"}
            className="w-auto max-w-full sm:max-w-[280px] md:max-w-[300px] rounded-t-xl shadow object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              const messageElement = e.target.closest("[data-message-id]");
              const messageId = messageElement?.getAttribute("data-message-id");
              const message = messages.find(
                (msg) => (msg._id || msg.id) === messageId
              );
              const isUserMessage =
                message?.sender?._id === currentUser?._id ||
                message?.sender === "user";

              setSelectedMediaPreview({
                type: "image",
                url: mediaUrl,
                name: name || "Image",
                fileData: fileData,
                sender: isUserMessage ? currentUser : selectedFriend,
                isUserMessage: isUserMessage,
              });
            }}
            onLoad={() => {
              if (!url && fileData instanceof File) {
                URL.revokeObjectURL(mediaUrl);
              }
            }}
          />
          {name && (
            <p className="text-xs text-gray-500 mt-1 truncate max-w-full">
              {name}
            </p>
          )}
        </div>
      );
    } else if (isVideo) {
      return (
        <div className="mb-2 max-w-full">
          <video
            src={mediaUrl}
            className="w-auto max-w-full sm:max-w-[280px] md:max-w-[300px] max-h-48 rounded-t-xl shadow object-cover cursor-pointer"
            preload="metadata"
            onClick={(e) => {
              const messageElement = e.target.closest("[data-message-id]");
              const messageId = messageElement?.getAttribute("data-message-id");
              const message = messages.find(
                (msg) => (msg._id || msg.id) === messageId
              );
              const isUserMessage =
                message?.sender?._id === currentUser?._id ||
                message?.sender === "user";

              setSelectedMediaPreview({
                type: "video",
                url: mediaUrl,
                name: name || "Video",
                fileData: fileData,
                sender: isUserMessage ? currentUser : selectedFriend,
                isUserMessage: isUserMessage,
              });
            }}
            onLoadedData={() => {
              if (!url && fileData instanceof File) {
                URL.revokeObjectURL(mediaUrl);
              }
            }}
          />
          {name && (
            <p className="text-xs text-gray-500 mt-1 truncate max-w-full">
              {name}
            </p>
          )}
        </div>
      );
    } else if (isAudio) {
      return (
        <div className="mb-2 max-w-full">
          <div
            className="flex items-center gap-2 p-3 bg-white bg-opacity-20 rounded-lg cursor-pointer hover:bg-opacity-30 max-w-full overflow-hidden"
            onClick={(e) => {
              const messageElement = e.target.closest("[data-message-id]");
              const messageId = messageElement?.getAttribute("data-message-id");
              const message = messages.find(
                (msg) => (msg._id || msg.id) === messageId
              );
              const isUserMessage =
                message?.sender?._id === currentUser?._id ||
                message?.sender === "user";

              setSelectedMediaPreview({
                type: "audio",
                url: mediaUrl,
                name: name || "Audio File",
                fileData: fileData,
                sender: isUserMessage ? currentUser : selectedFriend,
                isUserMessage: isUserMessage,
              });
            }}
          >
            <svg
              className="min-w-6 w-6 h-6 text-current"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657a1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.895-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829a1 1 0 11-1.415-1.414A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.415a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {name || "Audio File"}
              </p>
              <p className="text-xs text-opacity-70">Click to play</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await deleteMessageForMeApi(messageId);
      toast.success("Message deleted for you");

      if (refreshMessages) refreshMessages();
    } catch (error) {
      console.error("Delete for me failed:", error);
      toast.error("Could not delete the message");
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!deleteMessageId) return;

    setDeleteLoading(true);
    try {
      const response = await deleteMessageForEveryoneApi(deleteMessageId);
      console.log("Delete for everyone response:", response);
      toast.success("Message deleted for everyone");

      if (refreshMessages) refreshMessages();
      setDeleteModalOpen(false);
      setDeleteMessageId(null);
    } catch (error) {
      console.error("Delete for everyone failed:", error);
      toast.error("Could not delete message for everyone");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditMessage = async (editedContent) => {
    if (!editMessageData || !editedContent.trim()) return;

    setEditLoading(true);
    try {
      const response = await editChatMessageApi(
        editMessageData._id || editMessageData.id,
        editedContent
      );
      toast.success("Message edited successfully");
      setEditModalOpen(false);
      setEditMessageData(null);
      if (refreshMessages) {
        refreshMessages();
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");
    } finally {
      setEditLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentChat || !currentChat._id) {
      toast.error("Chat information not available");
      setClearChatModalOpen(false);
      return;
    }

    setClearChatLoading(true);
    try {
      await deleteAllMessagesInChatApi(currentChat._id);
      toast.success("Chat cleared successfully");
      setClearChatModalOpen(false);
      if (refreshMessages) {
        refreshMessages();
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat");
    } finally {
      setClearChatLoading(false);
    }
  };

  const handleSearchToggle = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setSearchQuery("");
      setSearchResults([]);
      setCurrentSearchIndex(0);
    } else {
      setIsSearchActive(true);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      handleSearchToggle();
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigateSearchResults("next");
    }
  };

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex = currentSearchIndex;
    if (direction === "next") {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex =
        currentSearchIndex === 0
          ? searchResults.length - 1
          : currentSearchIndex - 1;
    }
    setCurrentSearchIndex(newIndex);

    const targetMessage = searchResults[newIndex];
    const messageElement = document.querySelector(
      `[data-message-id="${targetMessage._id || targetMessage.id}"]`
    );
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const highlightSearchText = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-300 text-gray-900 rounded px-1 py-0.5 font-medium"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  const handlePreviewFromModal = (bg) => {
    if (bg.type === "reset") {
      setPreviewBackground(null);
      setIsPreviewing(false);
      return;
    }
    setPreviewBackground(bg);
    setIsPreviewing(true);
  };

  const handleSavePreview = async () => {
    if (!currentChat || !previewBackground) return;
    let wallpaperData = {};
    if (previewBackground.type === "wallpaper") {
      if (previewBackground.file) {
        wallpaperData = new FormData();
        wallpaperData.append("type", "wallpaper");
        wallpaperData.append("wallpaper", previewBackground.file);
      } else {
        wallpaperData = { type: "wallpaper", value: previewBackground.value };
      }
    } else if (previewBackground.type === "color") {
      wallpaperData = { type: "color", value: previewBackground.value };
    }
    try {
      await setChatWallpaperApi(currentChat._id, wallpaperData);
      setChatWallpaper(previewBackground);
      setPreviewBackground(null);
      setIsPreviewing(false);
      setShowWallpaperSelector(false);
    } catch (err) {}
  };

  const handleCancelPreview = () => {
    setPreviewBackground(null);
    setShowWallpaperSelector(true);
    setIsPreviewing(false);
  };
  const computeBackgroundStyle = (wallpaper) => {
    if (!wallpaper) return {};
    if (wallpaper.type === "color") {
      return { background: wallpaper.value };
    }
    if (wallpaper.type === "wallpaper" || wallpaper.type === "image") {
      return {
        backgroundImage: `url(${wallpaper.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const handleResetWallpaper = async () => {
    if (!currentChat || !currentChat._id) return;
    try {
      await removeChatWallpaperApi(currentChat._id);
      setChatWallpaper(null);
      toast.success("Wallpaper reset to default");
      setPreviewBackground(null);
      setIsPreviewing(false);
      setShowWallpaperSelector(false);
    } catch (err) {
      toast.error("Failed to reset wallpaper");
      console.error(err);
    }
  };

  const FetchWallpaper = async (chatId) => {
    try {
      const wallpaper = await getChatWallpaperApi(chatId);
      if (wallpaper) {
        setChatWallpaper(wallpaper);
      } else {
        setChatWallpaper(null);
      }
    } catch (err) {
      setChatWallpaper(null);
    }
  };
  useEffect(() => {
    if (currentChat && currentChat._id) {
      FetchWallpaper(currentChat._id);
    } else {
      setChatWallpaper(null);
    }
  }, [currentChat]);

  if (!selectedFriend) {
    return (
      <div className="h-full bg-white rounded-r-lg flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="bg-gray-100 p-6 rounded-full">
            <TbMessages className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Chats</h3>
          <p className="mt-2 text-sm text-gray-500">
            Select a friend to start conversation
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-400">
              {isSocketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showMediaGallery && selectedFriend) {
    return (
      <div className="h-full flex flex-col bg-white rounded-r-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex mb-[1.2px] mt-4 md:mt-0 items-center gap-3">
            <button
              onClick={() => setShowMediaGallery(false)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-lg font-medium">Media</h2>
              <p className="text-sm text-gray-500">
                {messages.filter((msg) => msg.media).length}
                <span className="ml-1">Media files shared in this chat</span>
              </p>
            </div>
          </div>
        </div>

        <MediaGallery
          messages={messages}
          selectedFriend={selectedFriend}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="h-full mt-6 flex flex-col bg-white rounded-r-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b">
        <div
          className={`flex items-center gap-2 sm:gap-3 ${
            isSearchActive && isMobile ? "max-w-[30%]" : ""
          }`}
        >
          {(isMobile || isTablet) && onBackClick && (
            <button
              onClick={onBackClick}
              className="p-1.5 rounded-full text-gray-800 hover:bg-gray-50 transition-colors mr-1"
              aria-label="Back to chat list"
            >
              <FaArrowLeft className="h-4 w-4" />
            </button>
          )}
          {(!isSearchActive || !isMobile) && (
            <Avatar
              onClick={() => route.push(`/profile/${selectedFriend._id}`)}
              src={selectedFriend.profilePicture?.url || "/avatar.webp"}
              name={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          )}
          {(!isSearchActive || !isMobile) && (
            <div className="max-w-[100%]  h-full">
              <h3 className="font-semibold text-sm sm:text-base truncate ">
                {selectedFriend.firstName} {selectedFriend.lastName}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    isSocketConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>{isSocketConnected ? "Online" : "Offline"}</span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1 sm:gap-2 ${
            isSearchActive && isMobile ? "flex-1" : ""
          }`}
        >
          {isSearchActive && (
            <div className={`relative ${isMobile ? "w-full" : ""}`}>
              <div className="flex items-center gap-1 sm:gap-2 w-full">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={isMobile ? "Search..." : "Search messages..."}
                    className="w-full px-3 sm:px-4 py-1 sm:py-1.5 pl-8 sm:pl-10 pr-2 sm:pr-4 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <FiSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>

                <button
                  onClick={handleSearchToggle}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                  title="Close search"
                >
                  <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <div className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500 min-w-[40px] sm:min-w-[80px] flex items-center justify-end">
                  {isSearching ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="animate-spin rounded-full h-2 w-2 sm:h-3 sm:w-3 border-b-2 border-blue-500"></div>
                      <span className="text-xs hidden sm:inline">
                        Searching...
                      </span>
                    </div>
                  ) : null}
                </div>

                {searchResults.length > 0 && (
                  <div
                    className={`${
                      isMobile
                        ? "absolute top-full right-0"
                        : "absolute top-full right-0"
                    } mt-2 bg-white shadow-md rounded-lg border p-2 flex items-center justify-between gap-2 z-50`}
                  >
                    <span className="text-xs sm:text-sm text-gray-600">
                      {currentSearchIndex + 1} of {searchResults.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigateSearchResults("prev")}
                        className="p-1.5 rounded bg-white border hover:bg-gray-50 transition-colors"
                        title="Previous result"
                      >
                        <MdOutlineKeyboardArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigateSearchResults("next")}
                        className="p-1.5 rounded bg-white border hover:bg-gray-50 transition-colors"
                        title="Next result"
                      >
                        <MdOutlineKeyboardArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {searchQuery.trim() &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div
                    className={`${
                      isMobile
                        ? "fixed top-16 left-0 right-0 mx-auto w-[90%] max-w-xs"
                        : "absolute top-full right-0"
                    } mt-2 z-50 bg-white shadow-md rounded-lg border px-3 py-2 text-xs sm:text-sm text-gray-500 text-center`}
                  >
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
            </div>
          )}

          {!isSearchActive && !isMobile && (
            <button
              onClick={handleSearchToggle}
              className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title="Search messages"
            >
              <FiSearch className="h-5 w-5" />
            </button>
          )}

          {refreshMessages && !isMobile && (
            <button
              onClick={refreshMessages}
              className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title="Refresh messages"
            >
              <IoIosRefresh className="h-5 w-5" />
            </button>
          )}
          <div className="ml-auto text-gray-700 bg-gray-100 p-1 rounded-lg cursor-pointer">
            <Dropdown placement="bottom-end">
              <Dropdown.Trigger>
                <ActionIcon
                  variant="outline"
                  className="border-none cursor-pointer"
                  rounded="full"
                >
                  <BsThreeDotsVertical className="h-4 w-4" />
                </ActionIcon>
              </Dropdown.Trigger>
              <Dropdown.Menu className="border-none shadow w-48 bg-gray-50">
                {(isMobile || (!isMobile && !isSearchActive)) && (
                  <div onClick={handleSearchToggle} className="my-4">
                    <Dropdown.Item>
                      <div className="flex items-center cursor-pointer">
                        <FiSearch className="mr-2 text-blue-500 h-4 w-4" />
                        Search
                      </div>
                    </Dropdown.Item>
                  </div>
                )}

                {isMobile && refreshMessages && (
                  <div onClick={refreshMessages} className="my-4">
                    <Dropdown.Item>
                      <div className="flex items-center cursor-pointer">
                        <IoIosRefresh className="mr-2 text-blue-500 h-4 w-4" />
                        Refresh Messages
                      </div>
                    </Dropdown.Item>
                  </div>
                )}

                <div className="my-4">
                  <Dropdown.Item>
                    <div
                      onClick={() => setShowMediaGallery(true)}
                      className="flex items-center cursor-pointer"
                    >
                      <MdOutlinePermMedia className="mr-2 text-green-500 h-4 w-4" />
                      Media
                    </div>
                  </Dropdown.Item>
                </div>
                <div className="my-4">
                  <Dropdown.Item>
                    <div
                      onClick={() => setShowWallpaperSelector(true)}
                      className="flex items-center cursor-pointer"
                    >
                      <FcEditImage className="mr-2 text-green-500 h-4 w-4" />
                      Wallpaper
                    </div>
                  </Dropdown.Item>
                </div>
                <div
                  className="my-4"
                  onClick={() => {
                    setClearChatModalOpen(true);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Dropdown.Item>
                    <div className="flex items-center cursor-pointer">
                      <MdDeleteOutline className="mr-2 text-red-500 h-4 w-4" />
                      Clear Chat
                    </div>
                  </Dropdown.Item>
                </div>

                <div onClick={() => route.push("/chat")} className="mb-4 ">
                  <Dropdown.Item>
                    <div className="flex items-center cursor-pointer">
                      <MdOutlineLogout className="mr-2 text-gray-500 h-4 w-4" />
                      Close Chat
                    </div>
                  </Dropdown.Item>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto  custom-scrollbar p-4 space-y-4 relative"
        id="chat-messages-container"
        style={
          isPreviewing && previewBackground
            ? computeBackgroundStyle(previewBackground)
            : computeBackgroundStyle(chatWallpaper)
        }
      >
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              {!currentChat ? (
                <>
                  <p className="text-sm">Send a message to start a chat</p>
                  <p className="text-xs mt-1">
                    A chat will be created when you send your first message
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation!</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className=" relative z-10 space-y-4">
            {hasMoreMessages && (
              <div ref={topLoaderRef} className="flex justify-center pb-2">
                <button
                  onClick={() => {
                    console.log("🔴 Load More Messages Button Clicked!");
                    console.log("Button state:", {
                      hasMoreMessages,
                      isLoadingMoreMessages,
                    });
                    loadMoreMessages();
                  }}
                  disabled={isLoadingMoreMessages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  {isLoadingMoreMessages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <IoIosArrowDown className="h-4 w-4" />
                      Load older messages
                    </>
                  )}
                </button>
              </div>
            )}
            {isPreviewing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Avatar name="" src="/avatar.webp" className="h-8 w-8" />
                  <div className=" relative rounded-xl max-w-md min-w-[100px] shadow-sm px-3 py-2 bg-white border rounded-bl-none ">
                    <p className="text-sm">
                      Hey! This is how messages will look.
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-end gap-2">
                  <div className=" relative rounded-xl max-w-md min-w-[100px] shadow-sm bg-blue-500 text-white rounded-br-none p-2">
                    <p className="text-sm">Looks perfect to me!</p>
                  </div>
                  <Avatar name="" src="/avatar.webp" className="h-8 w-8" />
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUserMessage =
                  msg.sender?._id === currentUser?._id || msg.sender === "user";
                const messageId = msg._id || msg.id;

                return (
                  <div
                    key={msg._id || msg.id}
                    data-message-id={msg._id || msg.id}
                    className={`relative group flex mb-7 ${
                      isUserMessage ? "justify-end" : "justify-start"
                    } ${
                      searchResults.length > 0 &&
                      searchResults[currentSearchIndex] &&
                      (searchResults[currentSearchIndex]._id === msg._id ||
                        searchResults[currentSearchIndex].id === msg.id)
                        ? "bg-yellow-100 rounded-lg p-2 -m-2"
                        : ""
                    } ${
                      highlightedMessageId === messageId
                        ? "message-highlight"
                        : ""
                    }`}
                  >
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {!isUserMessage && (
                        <Avatar
                          onClick={() =>
                            route.push(`/profile/${selectedFriend._id}`)
                          }
                          src={
                            selectedFriend.profilePicture?.url || "/avatar.webp"
                          }
                          name={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
                          className="h-8 w-8 cursor-pointer"
                        />
                      )}

                      <div
                        onClick={() =>
                          isMobile && setSelectedMessageId(messageId)
                        }
                        className={`${
                          msg.media || msg.file ? "max-w-md" : "max-w-sm"
                        } relative rounded-2xl max-w-md min-w-[100px] shadow-sm ${
                          isUserMessage
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white border rounded-bl-none"
                        } ${msg.isOptimistic ? "opacity-70" : ""}`}
                      >
                        <div
                          className={`absolute ${
                            isUserMessage
                              ? "-left-4 -translate-x-full"
                              : "-right-4 translate-x-full"
                          } top-1/2 -translate-y-1/2 ${
                            isMobile
                              ? selectedMessageId === messageId
                                ? "opacity-100"
                                : "opacity-0"
                              : "opacity-0 group-hover:opacity-100"
                          } transition-opacity duration-200 z-10`}
                        >
                          <div className="bg-white shadow-lg rounded-full px-2 py-1 border flex gap-2 items-center">
                            <div className="flex items-center gap-1">
                              {!showPicker ? (
                                <button
                                  onClick={() => setShowPicker(true)}
                                  className="text-base p-1 rounded-full hover:bg-gray-100 transition-all"
                                  title="React"
                                >
                                  😀
                                </button>
                              ) : (
                                <>
                                  {ReactionEmojis.map((emoji) => {
                                    const hasUserReacted = messageReactions[
                                      messageId
                                    ]?.[emoji]?.users?.includes(
                                      currentUser?._id
                                    );
                                    return (
                                      <button
                                        key={emoji}
                                        className={`text-lg transition-all duration-200 p-1 rounded-full ${
                                          hasUserReacted
                                            ? "scale-125"
                                            : "hover:scale-125 hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                          handleEmojiReaction(messageId, emoji);
                                          setShowPicker(false);
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    );
                                  })}

                                  <button
                                    onClick={() => setShowPicker(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-all text-gray-500"
                                    title="Close"
                                  >
                                    <IoMdClose className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <Dropdown
                              placement={isUserMessage ? "left" : "right"}
                              className=""
                            >
                              <Dropdown.Trigger>
                                <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                  <BsThreeDotsVertical className="h-4 w-4 text-gray-500" />
                                </button>
                              </Dropdown.Trigger>
                              <Dropdown.Menu className="bg-white shadow-lg border rounded-lg overflow-hidden w-60">
                                <Dropdown.Item>
                                  <div
                                    onClick={() => {
                                      setReplyToMessage(msg);
                                      setTimeout(() => {
                                        const input =
                                          document.querySelector(
                                            'input[type="text"]'
                                          );
                                        if (input) input.focus();
                                      }, 100);
                                    }}
                                    className="flex items-center w-full px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <HiArrowUturnLeft className="mr-3 h-4 w-4 text-purple-500" />
                                    <span className="text-sm">Reply</span>
                                  </div>
                                </Dropdown.Item>

                                <Dropdown.Item>
                                  <div className="flex items-center w-full px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                    <HiArrowUturnRight className="mr-3 h-4 w-4 text-green-500" />
                                    <span className="text-sm">Forward</span>
                                  </div>
                                </Dropdown.Item>

                                <Dropdown.Item>
                                  <div
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        msg.content || msg.text
                                      );
                                    }}
                                    className="flex items-center w-full px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <MdFileCopy className="mr-3 h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Copy</span>
                                  </div>
                                </Dropdown.Item>

                                {isUserMessage && (
                                  <Dropdown.Item>
                                    <div
                                      onClick={() => {
                                        setEditMessageData(msg);
                                        setEditModalOpen(true);
                                      }}
                                      className="flex items-center w-full px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <MdOutlineEdit className="mr-3 h-4 w-4 text-blue-500" />
                                      <span className="text-sm">Edit</span>
                                    </div>
                                  </Dropdown.Item>
                                )}

                                <div className="border-t">
                                  <Dropdown.Item>
                                    <div
                                      onClick={() =>
                                        handleDeleteForMe(msg._id || msg.id)
                                      }
                                      className="flex items-center w-full px-3 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                                    >
                                      <MdDeleteOutline className="mr-3 h-4 w-4" />
                                      <span className="text-sm">
                                        Delete for me
                                      </span>
                                    </div>
                                  </Dropdown.Item>

                                  {isUserMessage && (
                                    <Dropdown.Item>
                                      <div
                                        onClick={() => {
                                          setDeleteModalOpen(true);
                                          setDeleteMessageId(msg._id || msg.id);
                                        }}
                                        className="flex items-center w-full whitespace-nowrap px-3 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                                      >
                                        <MdDeleteOutline className="mr-3 h-4 w-4" />
                                        <span className="text-sm">
                                          Delete for everyone
                                        </span>
                                      </div>
                                    </Dropdown.Item>
                                  )}
                                </div>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>

                        {(msg.media || msg.file) &&
                          renderMessageMedia(msg.media || msg.file)}

                        {msg.productData && (
                          <div className="mx-4 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              {msg.productData.images &&
                                msg.productData.images.length > 0 && (
                                  <img
                                    src={
                                      msg.productData.images[0].url ||
                                      "/not-found.png"
                                    }
                                    alt={msg.productData.name}
                                    className="w-16 h-16 object-cover rounded border bg-white"
                                  />
                                )}
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-semibold text-sm text-blue-900 truncate">
                                  {msg.productData.name}
                                </span>
                                <span className="text-sm text-blue-700">
                                  Price:{" "}
                                  <span className="font-bold">
                                    ${msg.productData.price}
                                  </span>
                                </span>
                                {msg.productData.description && (
                                  <span className="text-xs text-blue-600 mt-1 line-clamp-2">
                                    {msg.productData.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {msg.replyTo && (
                          <div
                            className={`mx-4 mt-3 p-2 rounded border-l-2 ${
                              isUserMessage
                                ? "bg-blue-400 border-blue-200 text-blue-100"
                                : "bg-gray-100 border-gray-300 text-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <HiArrowUturnLeft
                                className={`h-4 w-4 ${
                                  isUserMessage
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              />
                              <span className="text-xs font-medium">
                                {msg.replyTo.sender?._id === currentUser?._id
                                  ? "You"
                                  : selectedFriend.firstName}
                              </span>
                            </div>
                            <p className="text-xs opacity-90 line-clamp-2">
                              {msg.replyTo.content ||
                                msg.replyTo.text ||
                                "Media message"}
                            </p>
                          </div>
                        )}

                        {(msg.content || msg.text) && (
                          <div
                            className={`px-4 ${msg.replyTo ? "py-2" : "py-3"}`}
                          >
                            <p
                              className={`text-sm ${
                                isUserMessage ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {searchQuery.trim()
                                ? highlightSearchText(
                                    msg.content || msg.text,
                                    searchQuery
                                  )
                                : msg.content || msg.text}
                            </p>
                          </div>
                        )}

                        <div
                          className={`flex items-center ${
                            isUserMessage ? "justify-end" : "justify-start"
                          }  px-4 pb-2`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs ${
                                isUserMessage
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(msg.createdAt || msg.timestamp)}
                            </span>
                            {isUserMessage && (
                              <span
                                className="text-xs text-blue-100"
                                title="Message delivered"
                              >
                                <BiCheckDouble size={18} />
                              </span>
                            )}
                          </div>
                        </div>

                        {messageReactions[msg._id || msg.id] &&
                          Object.keys(messageReactions[msg._id || msg.id])
                            .length > 0 && (
                            <div
                              className={`absolute -bottom-6 ${
                                isUserMessage ? "left-2" : "right-2"
                              } `}
                              title="Click to view who reacted"
                            >
                              <div className="flex items-center px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200">
                                {Object.entries(
                                  messageReactions[msg._id || msg.id]
                                ).map(([emoji, reactionData], index) => (
                                  <div
                                    key={emoji}
                                    className="flex items-center"
                                  >
                                    <span
                                      className="text-xs cursor-pointer hover:scale-110 transition-transform"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmojiReaction(
                                          msg._id || msg.id,
                                          emoji
                                        );
                                      }}
                                      title={`React with ${emoji}`}
                                    >
                                      {emoji}
                                    </span>
                                    {reactionData.count > 1 && (
                                      <span className="text-xs font-medium text-gray-600 ml-0.5">
                                        {reactionData.count}
                                      </span>
                                    )}
                                    {index <
                                      Object.entries(
                                        messageReactions[msg._id || msg.id]
                                      ).length -
                                        1 && ""}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {isUserMessage && (
                        <Avatar
                          onClick={() =>
                            route.push(`/profile/${currentUser._id}`)
                          }
                          src={
                            currentUser.profilePicture?.url || "/avatar.webp"
                          }
                          name={`${currentUser.firstName} ${currentUser.lastName}`}
                          className="h-8 w-8 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {isPreviewing && (
        <div className="flex justify-end gap-3 p-3 border-t bg-white">
          <button
            onClick={handleCancelPreview}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePreview}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}

      <div className="p-4  border-t">
        {showProductReply && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-center gap-3 text-blue-700 relative">
            {productReplyLoading ? (
              <span>Loading product info...</span>
            ) : productReply ? (
              <>
                <img
                  src={productReply.images?.[0]?.url || "/not-found.png"}
                  alt={productReply.name}
                  className="w-16 h-16 object-cover rounded border bg-white"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-base truncate">
                    {productReply.name}
                  </span>
                  <span className="text-sm">
                    Price:{" "}
                    <span className="font-bold">${productReply.price}</span>
                  </span>
                  {productReply.description && (
                    <span className="text-xs text-blue-900 mt-1 line-clamp-2">
                      {productReply.description}
                    </span>
                  )}
                </div>
                <button
                  className="absolute top-2 right-2 text-blue-400 hover:text-red-500"
                  onClick={handleDismissProductReply}
                  title="Dismiss"
                >
                  <RxCross2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <span>Product not found.</span>
            )}
          </div>
        )}

        {replyToMessage && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <HiArrowUturnLeft className="text-sm font-medium text-blue-700" />
                  <span className="text-sm font-medium text-blue-700">
                    Replying to{" "}
                    {replyToMessage.sender?._id === currentUser?._id
                      ? "yourself"
                      : `${selectedFriend.firstName}`}
                  </span>
                </div>
                <div className="bg-white rounded p-2 border">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {replyToMessage.content ||
                      replyToMessage.text ||
                      "Media message"}
                  </p>
                  {replyToMessage.media && (
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MdOutlinePermMedia className="h-4 w-4" />
                      {replyToMessage.media.type === "image"
                        ? "Photo"
                        : replyToMessage.media.type === "video"
                        ? "Video"
                        : "Media"}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyToMessage(null)}
                className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <RxCross2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Selected media:
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              {getFilePreview(selectedFile)}
            </div>
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center w-full gap-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <IoMdMic className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <IoMicOutline className="h-6 w-6 text-gray-500" />
            )}
          </button>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*"
          />
          <label
            htmlFor="file-upload"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <IoIosAttach className="h-6 w-6 text-gray-500" />
          </label>
          <div
            className={`w-full bg-gray-100 rounded-lg relative ${
              isListening ? "ring-2 ring-red-400" : ""
            }`}
          >
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder={
                isListening
                  ? "Listening..."
                  : replyToMessage
                  ? `Reply to ${
                      replyToMessage.sender?._id === currentUser?._id
                        ? "yourself"
                        : selectedFriend.firstName
                    }...`
                  : selectedFile
                  ? "Add a caption (optional)..."
                  : "Type a message..."
              }
              className={`flex-1 w-full py-2 px-4 focus:outline-none bg-transparent ${
                isListening ? "placeholder:text-red-400" : ""
              }`}
            />
            <button
              type="button"
              className="p-2 absolute right-4 transition-colors cursor-pointer text-yellow-500"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              aria-label="Add emoji"
            >
              <MdEmojiEmotions className="h-5 w-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <div className="relative">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setMessage((prev) => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width="320px"
                    height="350px"
                    searchDisabled
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                    lazyLoadEmojis
                  />
                  <button
                    className="absolute cursor-pointer -top-2 -right-2 bg-gray-100 p-1 rounded-full text-red-400 hover:text-red-600"
                    onClick={() => setShowEmojiPicker(false)}
                    aria-label="Close"
                  >
                    <RxCross2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={
              !isSocketConnected ||
              (!message.trim() && !selectedFile) ||
              isListening
            }
            className="bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !isSocketConnected
                ? "Socket not connected"
                : isListening
                ? "Finish speaking first"
                : selectedFile && !message.trim()
                ? "Send media"
                : "Send message"
            }
          >
            <IoIosSend className="h-5 w-5" />
          </button>
        </form>
      </div>

      {deleteModalOpen && (
        <DeleteConfirmation
          deleteModalOpen={deleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
          setDeletePostId={setDeleteMessageId}
          HandleDelete={handleDeleteForEveryone}
          deleteLoading={deleteLoading}
          title="Delete message for everyone?"
          message="This will permanently delete the message for all chat members."
        />
      )}

      {editModalOpen && (
        <EditMessage
          editModalOpen={editModalOpen}
          setEditModalOpen={setEditModalOpen}
          editMessageData={editMessageData}
          setEditMessageData={setEditMessageData}
          handleEditMessage={handleEditMessage}
          editLoading={editLoading}
        />
      )}

      {clearChatModalOpen && (
        <DeleteConfirmation
          deleteModalOpen={deleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
          setDeletePostId={setDeleteMessageId}
          HandleDelete={handleClearChat}
          deleteLoading={deleteLoading}
          title="Clear all messages from this chat?"
          message="This will permanently delete all the message from this chat"
        />
      )}
      {showWallpaperSelector && (
        <div className="fixed inset-0 bg-gray-200/90 z-[9999999] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowWallpaperSelector(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <RxCross2 />
            </button>

            <WallpaperSelector
              initialWallpaper={previewBackground?.value || chatWallpaper}
              onPreview={(bg) => {
                setShowWallpaperSelector(false);
                handlePreviewFromModal(bg);
              }}
              handleResetWallpaper={handleResetWallpaper}
              onClose={() => setShowWallpaperSelector(false)}
            />
          </div>
        </div>
      )}

      {selectedMediaPreview && (
        <div
          className="fixed inset-0 bg-gray-300 bg-opacity-40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedMediaPreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
              onClick={() => setSelectedMediaPreview(null)}
            >
              <RxCross2 />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-[70vh] flex items-center justify-center bg-black">
                {selectedMediaPreview.type === "image" && (
                  <img
                    src={selectedMediaPreview.url}
                    alt={selectedMediaPreview.name || "Image"}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                {selectedMediaPreview.type === "video" && (
                  <video
                    src={selectedMediaPreview.url}
                    className="max-w-full max-h-full"
                    controls
                    autoPlay
                  />
                )}
                {selectedMediaPreview.type === "audio" && (
                  <div className="bg-white p-8 rounded-lg max-w-md w-full">
                    <h3 className="text-xl font-semibold text-center mb-4">
                      {selectedMediaPreview.name || "Audio File"}
                    </h3>
                    <div className="flex justify-center items-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <svg
                          className="w-16 h-16 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <audio
                      src={selectedMediaPreview.url}
                      controls
                      className="w-full mt-4"
                      autoPlay
                    />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  {selectedMediaPreview.sender && (
                    <>
                      <Avatar
                        src={
                          selectedMediaPreview.sender?.profilePicture?.url ||
                          "/avatar.webp"
                        }
                        name={`${selectedMediaPreview.sender?.firstName} ${selectedMediaPreview.sender?.lastName}`}
                        className="h-8 w-8"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {selectedMediaPreview.isUserMessage
                            ? "You"
                            : `${selectedMediaPreview.sender?.firstName} ${selectedMediaPreview.sender?.lastName}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedMediaPreview.isUserMessage
                            ? "Sent by you"
                            : "Sent by contact"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {selectedMediaPreview.name && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMediaPreview.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
