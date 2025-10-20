"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Avatar, Button, ActionIcon, Dropdown } from "rizzui";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Image as ImageIcon,
  Smile,
  Reply,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosRefresh, IoIosAttach, IoMdClose } from "react-icons/io";
import { FiSearch, FiX, FiShare2 } from "react-icons/fi";
import {
  MdOutlinePermMedia,
  MdDeleteOutline,
  MdOutlineLogout,
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
  MdEmojiEmotions,
  MdFileCopy,
  MdOutlineEdit,
} from "react-icons/md";
import { FcEditImage } from "react-icons/fc";
import { FaArrowLeft } from "react-icons/fa6";
import { HiArrowUturnLeft, HiArrowUturnRight } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { ReactionPicker } from "@/components/ReactionPicker";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import DeleteConfirmation from "../../chat/delete-model";
import EditMessage from "../../chat/edit-message";
import MediaGallery from "../../chat/media-gallery";
import WallpaperSelector from "../../chat/chat-walpaper";

const MarketplaceChatScreen = ({
  selectedChat,
  currentChat,
  messages = [],
  isSocketConnected,
  isLoadingMessages,
  isLoadingMoreMessages,
  hasMoreMessages,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onToggleReaction,
  typingUsers = [],
  onLoadMoreMessages,
  onRefreshMessages,
  isMobile = false,
  isTablet = false,
  onToggleSidebar,
  showSidebar,
  onBackClick,
  socketManager,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMessageData, setEditMessageData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [clearChatLoading, setClearChatLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [chatWallpaper, setChatWallpaper] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(null);
  const [selectedMediaPreview, setSelectedMediaPreview] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = () => {
    if (!selectedChat?.participants || !currentUser?.id) return null;
    const currentUserId = currentUser._id || currentUser.id;
    return selectedChat.participants.find(
      (participant) => participant._id !== currentUserId
    );
  };

  // Search functionality
  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setSearchQuery("");
      setSearchResults([]);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const results = messages.filter(
        (msg) =>
          msg.content && msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setCurrentSearchIndex(0);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        navigateSearchResults("next");
      }
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

    const messageId = searchResults[newIndex]._id;
    const messageElement = document.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      toast.success("Message deleted for you");
      if (onRefreshMessages) onRefreshMessages();
    } catch (error) {
      console.error("Delete for me failed:", error);
      toast.error("Could not delete the message");
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!deleteMessageId) return;

    setDeleteLoading(true);
    try {
      toast.success("Message deleted for everyone");
      if (onRefreshMessages) onRefreshMessages();
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
      toast.success("Message edited successfully");
      if (onRefreshMessages) onRefreshMessages();
      setEditModalOpen(false);
      setEditMessageData(null);
    } catch (error) {
      console.error("Edit message failed:", error);
      toast.error("Could not edit message");
    } finally {
      setEditLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat?._id) return;

    setClearChatLoading(true);
    try {
      toast.success("Chat cleared successfully");
      if (onRefreshMessages) onRefreshMessages();
      setClearChatModalOpen(false);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Clear chat failed:", error);
      toast.error("Could not clear chat");
    } finally {
      setClearChatLoading(false);
    }
  };

  const handleEmojiReaction = (messageId, emoji) => {
    if (onToggleReaction) {
      onToggleReaction(messageId, emoji);
    }
  };

  // Reaction emojis
  const ReactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥", "👎"];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping();
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() && !selectedFile && !replyingTo) return;

    try {
      if (selectedFile) {
        let mediaType = "file";
        if (selectedFile.type?.startsWith("image/")) {
          mediaType = "image";
        } else if (selectedFile.type?.startsWith("video/")) {
          mediaType = "video";
        } else if (selectedFile.type?.startsWith("audio/")) {
          mediaType = "audio";
        }

        await onSendMessage(
          messageInput.trim(),
          selectedFile,
          mediaType,
          replyingTo?._id
        );
      } else {
        await onSendMessage(messageInput.trim(), null, "text", replyingTo?._id);
      }

      setMessageInput("");
      setSelectedFile(null);
      setReplyingTo(null);

      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage("", file, "image");
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatOfferAmount = (offerDetails) => {
    if (!offerDetails?.amount) return "";
    return `$${offerDetails.amount} ${offerDetails.currency || "USD"}`;
  };

  const isOwnMessage = (message) => {
    return message.sender._id === currentUser?.id;
  };

  const renderMessage = (message, index) => {
    const isUserMessage = isOwnMessage(message);
    const messageId = message._id;
    const showAvatar =
      index === 0 || messages[index - 1]?.sender?._id !== message.sender._id;

    return (
      <div
        key={message._id}
        data-message-id={message._id}
        className={`relative group flex mb-7 ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex items-end gap-2 max-w-[70%]">
          {!isUserMessage && showAvatar && (
            <Avatar
              src={message.sender.profilePicture?.url || "/avatar.webp"}
              name={`${message.sender.firstName} ${message.sender.lastName}`}
              className="h-8 w-8 cursor-pointer"
            />
          )}
          {!isUserMessage && !showAvatar && <div className="w-8" />}

          <div
            className={`${
              message.media || message.file ? "max-w-md" : "max-w-sm"
            } relative rounded-2xl min-w-[100px] shadow-sm ${
              isUserMessage
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-white border rounded-bl-none"
            }`}
          >
            {/* Hover Actions */}
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
                        const hasUserReacted = messageReactions[messageId]?.[
                          emoji
                        ]?.users?.includes(currentUser?._id);
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
                <Dropdown placement={isUserMessage ? "left" : "right"}>
                  <Dropdown.Trigger>
                    <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                      <BsThreeDotsVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Menu className="bg-white shadow-lg border rounded-lg overflow-hidden w-60">
                    <Dropdown.Item>
                      <div
                        onClick={() => {
                          setReplyingTo(message);
                          setTimeout(() => {
                            const input = messageInputRef.current;
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
                          navigator.clipboard.writeText(message.content || "");
                          toast.success("Message copied to clipboard");
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
                            setEditMessageData(message);
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
                          onClick={() => handleDeleteForMe(message._id)}
                          className="flex items-center w-full px-3 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                        >
                          <MdDeleteOutline className="mr-3 h-4 w-4" />
                          <span className="text-sm">Delete for me</span>
                        </div>
                      </Dropdown.Item>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            {message.replyTo && (
              <div className="p-3 pb-2">
                <div
                  className={`text-xs mb-2 p-2 rounded ${
                    isUserMessage ? "bg-blue-600" : "bg-gray-100"
                  }`}
                >
                  <div className="font-medium">Replying to:</div>
                  <div className="truncate">{message.replyTo.content}</div>
                </div>
              </div>
            )}

            {/* Media content */}
            {message.messageType === "image" && message.media?.[0] && (
              <div className="mb-2">
                <img
                  src={message.media[0].url}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-t-xl"
                />
              </div>
            )}

            {/* Product share */}
            {message.messageType === "product_share" &&
              message.sharedProduct && (
                <div className="p-3">
                  <div className="border border-gray-300 rounded-lg p-3 mb-2 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        Shared Product
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {message.sharedProduct.images?.[0] && (
                        <img
                          src={message.sharedProduct.images[0]}
                          alt={message.sharedProduct.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {message.sharedProduct.name}
                        </div>
                        <div className="text-sm text-green-600">
                          ${message.sharedProduct.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Offer content */}
            {message.messageType === "offer" && message.offerDetails && (
              <div className="p-3">
                <div className="border border-green-300 rounded-lg p-3 mb-2 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">
                      Price Offer
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatOfferAmount(message.offerDetails)}
                  </div>
                  {message.offerDetails.expiresAt && (
                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Expires:{" "}
                      {new Date(
                        message.offerDetails.expiresAt
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <div className="p-3">
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {/* Message footer with time and reactions */}
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    isUserMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                  {message.isEdited && " (edited)"}
                </span>

                {message.reactions && message.reactions.length > 0 && (
                  <div
                    className={`flex gap-1 absolute
                    -bottom-6 ${isUserMessage ? "left-0" : "right-0"} mb-1`}
                  >
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          onToggleReaction &&
                          onToggleReaction(message._id, reaction.emoji)
                        }
                        className="text-xs bg-white rounded-full px-2 py-1 border hover:bg-gray-50 text-gray-900 shadow-sm"
                      >
                        {reaction.emoji}{" "}
                        {reaction.users?.length || reaction.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showReactionPicker === message._id && (
              <div className="absolute bottom-full right-0 mb-2 z-20">
                <ReactionPicker
                  onReactionSelect={(emoji) => {
                    onToggleReaction && onToggleReaction(message._id, emoji);
                    setShowReactionPicker(null);
                  }}
                  onClose={() => setShowReactionPicker(null)}
                />
              </div>
            )}
          </div>

          {isUserMessage && showAvatar && (
            <Avatar
              src={currentUser?.profilePicture?.url || "/avatar.webp"}
              name={`${currentUser?.firstName} ${currentUser?.lastName}`}
              className="h-8 w-8"
            />
          )}
        </div>
      </div>
    );
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a marketplace chat
          </h3>
          <p className="text-gray-500">
            Choose a conversation to start chatting about products
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

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
              onClick={() => router.push(`/profile/${otherParticipant?._id}`)}
              src={otherParticipant?.profilePicture?.url || "/avatar.webp"}
              name={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          )}
          {(!isSearchActive || !isMobile) && (
            <div className="max-w-[100%] h-full">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {otherParticipant?.firstName} {otherParticipant?.lastName}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                {selectedChat?.productRef?.images?.[0] && (
                  <img
                    src={
                      selectedChat.productRef.images[0].url ||
                      selectedChat.productRef.images[0]
                    }
                    alt={selectedChat.productRef.name}
                    className="w-3 h-3 rounded object-cover"
                  />
                )}
                <span className="truncate">
                  {selectedChat?.productRef?.name || "Product"}
                </span>
                {selectedChat?.productRef?.price && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      ${selectedChat.productRef.price}
                    </span>
                  </>
                )}
                <span>•</span>
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

          {/* Dropdown Menu */}
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

                <div onClick={() => router.push("/chat")} className="mb-4">
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

      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <div className="text-center mb-4">
                <button
                  onClick={onLoadMoreMessages}
                  disabled={isLoadingMoreMessages}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  {isLoadingMoreMessages ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}

            {messages.map((message, index) => renderMessage(message, index))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
                <span>{otherParticipant?.firstName} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t">
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <HiArrowUturnLeft className="text-sm font-medium text-blue-700" />
                  <span className="text-sm font-medium text-blue-700">
                    Replying to{" "}
                    {replyingTo.sender?._id === currentUser?._id
                      ? "yourself"
                      : `${otherParticipant?.firstName}`}
                  </span>
                </div>
                <div className="bg-white rounded p-2 border">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {replyingTo.content || replyingTo.text || "Media message"}
                  </p>
                  {replyingTo.media && (
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MdOutlinePermMedia className="h-4 w-4" />
                      {replyingTo.media.type === "image"
                        ? "Photo"
                        : replyingTo.media.type === "video"
                        ? "Video"
                        : "Media"}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <IoMdClose className="h-4 w-4" />
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
                <IoMdClose className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              {selectedFile && (
                <div className="max-w-xs">
                  {selectedFile.type?.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    <div className="p-4 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="flex items-center w-full gap-2"
        >
          <input
            type="file"
            id="file-upload-marketplace"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*"
          />

          <label
            htmlFor="file-upload-marketplace"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <IoIosAttach className="h-6 w-6 text-gray-500" />
          </label>

          <div className="w-full bg-gray-100 rounded-lg relative">
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={
                replyingTo
                  ? `Reply to ${
                      replyingTo.sender?._id === currentUser?._id
                        ? "yourself"
                        : otherParticipant?.firstName
                    }...`
                  : selectedFile
                  ? "Add a caption (optional)..."
                  : "Type a message..."
              }
              className="flex-1 w-full py-2 px-4 focus:outline-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
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
                      setMessageInput((prev) => prev + emojiData.emoji);
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
                    <IoMdClose className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              !isSocketConnected ||
              (!messageInput.trim() && !selectedFile) ||
              isTyping
            }
            className="bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !isSocketConnected
                ? "Socket not connected"
                : selectedFile && !messageInput.trim()
                ? "Send media"
                : "Send message"
            }
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {!isSocketConnected && (
          <div className="text-xs text-red-500 mt-2 text-center">
            Disconnected - messages may not be delivered
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <DeleteConfirmation
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteMessageId(null);
            setClearChatModalOpen(false);
          }}
          onConfirm={
            clearChatModalOpen ? handleClearChat : handleDeleteForEveryone
          }
          loading={clearChatModalOpen ? clearChatLoading : deleteLoading}
          title={clearChatModalOpen ? "Clear Chat" : "Delete Message"}
          message={
            clearChatModalOpen
              ? "Are you sure you want to clear all messages in this chat? This action cannot be undone."
              : "Are you sure you want to delete this message for everyone? This action cannot be undone."
          }
        />
      )}

      {editModalOpen && editMessageData && (
        <EditMessage
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditMessageData(null);
          }}
          onSave={handleEditMessage}
          loading={editLoading}
          initialContent={editMessageData.content || ""}
        />
      )}

      {showWallpaperSelector && (
        <WallpaperSelector
          isOpen={showWallpaperSelector}
          onClose={() => setShowWallpaperSelector(false)}
          currentWallpaper={chatWallpaper}
          onWallpaperSelect={(wallpaper) => {
            setChatWallpaper(wallpaper);
            setShowWallpaperSelector(false);
          }}
          onPreview={(wallpaper) => {
            setPreviewBackground(wallpaper);
            setIsPreviewing(true);
          }}
          onStopPreview={() => {
            setIsPreviewing(false);
            setPreviewBackground(null);
          }}
        />
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border p-2">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setMessageInput((prev) => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              width={300}
              height={400}
            />
          </div>
        </div>
      )}

      {selectedMediaPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">
                  {selectedMediaPreview.name || "Media"}
                </h3>
                <button
                  onClick={() => setSelectedMediaPreview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IoMdClose className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                {selectedMediaPreview.type === "image" && (
                  <img
                    src={selectedMediaPreview.url}
                    alt={selectedMediaPreview.name}
                    className="max-w-full max-h-[20vh] object-contain"
                  />
                )}
                {selectedMediaPreview.type === "video" && (
                  <video
                    src={selectedMediaPreview.url}
                    controls
                    className="max-w-full max-h-[20vh]"
                  />
                )}
                {selectedMediaPreview.type === "audio" && (
                  <audio
                    src={selectedMediaPreview.url}
                    controls
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceChatScreen;
