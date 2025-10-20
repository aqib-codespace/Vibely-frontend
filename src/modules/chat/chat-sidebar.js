"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { Avatar, Button } from "rizzui";
import { GetFriends } from "@/app/api/friends";
import { fetchUserChatsApi, globalSearchApi } from "@/app/api/chat";
import socketManager from "@/utils/socket";
import { FaUser } from "react-icons/fa";
import { BiMessageRounded } from "react-icons/bi";
import { Search, XCircle, Loader2 } from "lucide-react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useDebounce } from "@/hooks/useDebounce";

const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;

  try {
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  } catch (e) {
    return text;
  }
};

const ChatSidebar = ({
  onSelectUser,
  isMobile = false,
  chats: chatMessages = {},
  unreadCounts = {},
  selectedFriend = null,
}) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log("ChatSidebar props:", {
    chatMessages,
    unreadCounts,
    selectedFriend,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasFetchedFriends, setHasFetchedFriends] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const params = useParams();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const fetchFriends = useCallback(async () => {
    if (!user?.id || loading || hasFetchedFriends) return;

    try {
      setLoading(true);
      setHasFetchedFriends(true);
      const response = await GetFriends(1, 50);
      setFriends(response.data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, hasFetchedFriends]);

  useEffect(() => {
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id, fetchFriends]);

  useEffect(() => {
    if (params?.id && friends.length > 0) {
      const currentFriend = friends.find(
        (friend) => friend._id === params.id || friend.id === params.id
      );
      if (currentFriend) {
        setSelectedUser(currentFriend);
      }
    }
  }, [params?.id, friends]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        setSearchResults(null);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await globalSearchApi(debouncedSearchQuery);

        if (response && response.data) {
          console.log("Search response:", response.data);

          const processedResults = processSearchResults(response.data);
          setSearchResults(processedResults);
        } else {
          setSearchResults({ friends: [], messages: [] });
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ friends: [], messages: [] });
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const processSearchResults = (results) => {
    const combinedResults = {
      friends: [],
      messages: [],
    };

    results.forEach((result) => {
      if (result.friends && result.friends.length > 0) {
        result.friends.forEach((friend) => {
          combinedResults.friends.push({
            ...friend,
            chatId: result.chatId,
            isGroupChat: result.isGroupChat,
            otherUsers: result.otherUsers || [],
          });
        });
      }

      if (result.messages && result.messages.length > 0) {
        result.messages.forEach((message) => {
          combinedResults.messages.push({
            ...message,
            chatId: result.chatId,
            isGroupChat: result.isGroupChat || false,
            sender: message.sender || {},
            friends: result.friends || [],

            otherUsers: result.otherUsers || [],
          });
        });
      }
    });

    return combinedResults;
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelectMessage = (chatId, messageId, message) => {
    let navigationId = chatId;
    const userId = user?._id || user?.id;

    if (
      !message.isGroupChat &&
      message.otherUsers &&
      message.otherUsers.length > 0
    ) {
      const otherUser = message.otherUsers[0];
      const otherUserId = otherUser._id;
      if (otherUserId) {
        navigationId = otherUserId;
      }
    } else if (
      !message.isGroupChat &&
      message.friends &&
      message.friends.length > 0
    ) {
      const friendId = message.friends[0]._id || message.friends[0].id;
      if (friendId) {
        navigationId = friendId;
      }
    } else if (!message.isGroupChat && message.sender && userId) {
      const senderId = message.sender._id || message.sender.id;

      if (senderId && senderId !== userId) {
        navigationId = senderId;
      }
    }
    if (messageId) {
      sessionStorage.setItem("scrollToMessageId", messageId);
    }

    router.push(`/chat/${navigationId}`);
    setSearchQuery("");
    setSearchResults(null);
  };

  const filteredFriends = friends
    .filter((friend) => {
      const name = `${friend.firstName} ${friend.lastName}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;

      const aLastMessage = chatMessages[aId]?.lastMessage;
      const bLastMessage = chatMessages[bId]?.lastMessage;

      if (aLastMessage && bLastMessage) {
        return (
          new Date(bLastMessage.createdAt) - new Date(aLastMessage.createdAt)
        );
      }

      if (aLastMessage && !bLastMessage) return -1;
      if (!aLastMessage && bLastMessage) return 1;

      const aName = `${a.firstName || ""} ${a.lastName || ""}`;
      const bName = `${b.firstName || ""} ${b.lastName || ""}`;
      return aName.localeCompare(bName);
    });

  const handleSelectUser = (friend) => {
    setSelectedUser(friend);

    const friendId = friend._id || friend.id;

    setSearchQuery("");
    setSearchResults(null);
    router.push(`/chat/${friendId}`);

    if (typeof onSelectUser === "function") {
      onSelectUser(friend);
    }
  };

  return (
    <div className="h-full flex flex-col border-r bg-white rounded-l-lg">
      {isMobile && (
        <div className="p-4 border-b sticky top-4 bg-white z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.profilePicture?.url || "/avatar.webp"}
                name={fullName}
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold text-sm sm:text-base">
                  {fullName}
                </h3>
                <span className="text-gray-500 text-xs">@{user?.userName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 mt-1 border-b sm:mt-2 flex items-center gap-2 sticky top-0 bg-white z-10">
        <div className="relative mb-2  w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isMobile ? "Search" : "Search people and messages"}
            className="bg-white border w-full py-2  pl-9 pr-8 rounded-lg text-xs sm:text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 sm:p-2 pb-16 sm:pb-2">
        {searchLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Searching...</p>
          </div>
        ) : searchResults ? (
          <div className="space-y-2">
            {searchResults.friends.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <FaUser className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">People</h3>
                </div>
                <div className="space-y-1 mb-4">
                  {searchResults.friends.map((friend) => {
                    const friendId = friend._id || friend.id;
                    const name = `${friend.firstName || ""} ${
                      friend.lastName || ""
                    }`;
                    return (
                      <div
                        key={friendId}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSelectUser(friend)}
                      >
                        <Avatar
                          src={friend.profilePicture?.url || "/avatar.webp"}
                          name={name}
                          className="h-10 w-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4
                              className="font-medium text-sm truncate search-highlight"
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                  name,
                                  debouncedSearchQuery
                                ),
                              }}
                            ></h4>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {friend.userName ? `@${friend.userName}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {searchResults.messages.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <BiMessageRounded className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Messages</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.messages.map((message) => {
                    const senderName = message.sender?.firstName
                      ? `${message.sender.firstName || ""} ${
                          message.sender.lastName || ""
                        }`.trim()
                      : "Unknown";

                    return (
                      <div
                        key={message._id}
                        className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          handleSelectMessage(
                            message.chatId,
                            message._id,
                            message
                          )
                        }
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={
                              message.sender?.profilePicture?.url ||
                              "/avatar.webp"
                            }
                            name={senderName}
                            className="h-10 w-10 mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">
                              {senderName}
                            </h4>
                            <p
                              className="text-sm text-gray-700 search-highlight"
                              dangerouslySetInnerHTML={{
                                __html:
                                  message.highlightedContent ||
                                  highlightSearchTerm(
                                    message.content,
                                    debouncedSearchQuery
                                  ),
                              }}
                            ></p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {searchResults.friends.length === 0 &&
              searchResults.messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-sm px-2 mb-2">Friends</h3>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredFriends.length > 0 ? (
              <div className="space-y-1">
                {filteredFriends.map((friend) => {
                  const friendId = friend._id || friend.id;
                  return (
                    <div
                      key={friendId}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedUser?._id === friendId ||
                        selectedUser?.id === friendId
                          ? "bg-gray-50"
                          : ""
                      }`}
                      onClick={() => handleSelectUser(friend)}
                    >
                      <Avatar
                        src={friend.profilePicture?.url || "/avatar.webp"}
                        name={`${friend.firstName || ""} ${
                          friend.lastName || ""
                        }`}
                        className="h-10 w-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm truncate">
                            {friend.firstName || ""} {friend.lastName || ""}
                          </h4>
                          <div className="flex items-center gap-2">
                            {chatMessages[friendId]?.lastMessage?.createdAt && (
                              <span className="text-xs text-gray-400">
                                {formatTime(
                                  chatMessages[friendId].lastMessage.createdAt
                                )}
                              </span>
                            )}
                            {/* Show unread counter only if user is not in this chat */}
                            {unreadCounts[friendId] > 0 &&
                              selectedFriend?._id !== friendId && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center">
                                  {unreadCounts[friendId] > 99
                                    ? "99+"
                                    : unreadCounts[friendId]}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Show blue ticks for own messages in sidebar */}
                          {chatMessages[friendId]?.lastMessage?.sender?._id ===
                            user?.id && (
                            <span className="text-blue-500 text-xs">✓✓</span>
                          )}
                          <p className="text-xs text-gray-500 truncate flex-1">
                            {chatMessages[friendId]?.lastMessage
                              ? chatMessages[friendId].lastMessage.content ||
                                (chatMessages[friendId].lastMessage.media
                                  ? "Sent media"
                                  : "")
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No friends found {searchQuery && "matching your search"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
