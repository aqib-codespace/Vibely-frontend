"use client";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_ICONS,
} from "@/constants/notifications";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoCheckmarkDoneOutline, IoTimeOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdMarkEmailRead } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowActions(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (notification.status === "unread") {
      await markAsRead(notification._id);
    }

    if (notification.type === NOTIFICATION_TYPE.NEW_MESSAGE) {
      window.location.href = `/chat/${notification.relatedId}`;
    } else if (
      notification.type === NOTIFICATION_TYPE.POST_LIKED ||
      notification.type === NOTIFICATION_TYPE.POST_COMMENT
    ) {
      window.location.href = `/post/${notification.relatedId}`;
    } else if (notification.type === NOTIFICATION_TYPE.VIDEO_LIKED) {
      window.location.href = `/watch-videos/${notification.relatedId}`;
    } else if (notification.type === NOTIFICATION_TYPE.FRIEND_REQUEST) {
      window.location.href = "/friends";
    }

    setIsOpen(false);
  };

  const formatNotificationTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  const getNotificationIcon = (type) => {
    return NOTIFICATION_ICONS[type] || "🔔";
  };

  const getNotificationMessage = (notification) => {
    const baseMessage =
      NOTIFICATION_MESSAGES[notification.type] || "sent you a notification";
    return `${notification.sender?.firstName || "Someone"} ${baseMessage}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gray-100 p-2 cursor-pointer rounded-md hover:bg-gray-200 transition-colors duration-200"
      >
        <IoMdNotificationsOutline className="h-5 w-5 text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[10000] max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <MdMarkEmailRead className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <IoMdNotificationsOutline className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm">
                  When you get notifications, they all show up here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications
                  .filter(
                    (notification, index, self) =>
                      index ===
                      self.findIndex((n) => n._id === notification._id)
                  )
                  .map((notification) => {
                    if (notification.type === NOTIFICATION_TYPE.WELCOME) {
                      return (
                        <div
                          key={notification._id}
                          className={`p-4 cursor-pointer transition-colors duration-200 relative ${
                            notification.status === "unread" ? "bg-black text-white" : "bg-white text-black"
                          } border ${notification.status === "unread" ? "border-black" : "border-gray-200"} rounded-lg`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold text-lg">
                              V
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold ${notification.status === "unread" ? "text-white" : "text-black"}`}>
                                Welcome to Vibely
                              </h4>
                              <p className={`text-xs mt-2 ${notification.status === "unread" ? "text-gray-100" : "text-gray-700"}`}>
                                {notification.message || "Welcome to Vibely — connect, create, and discover. Start by completing your profile and exploring the feed."}
                              </p>

                              <div className="mt-3 flex items-center gap-2">
                                <Link
                                  href="/profile-setting"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.dismiss();
                                  }}
                                  className={`text-xs px-3 py-1 rounded-md border ${notification.status === "unread" ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"} transition-colors`}
                                >
                                  Complete profile
                                </Link>

                                <Link
                                  href="/"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.dismiss();
                                  }}
                                  className={`text-xs ${notification.status === "unread" ? "text-gray-100" : "text-gray-700"} underline`}
                                >
                                  Explore feed
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 relative ${
                          notification.status === "unread" ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {notification.sender?.profilePicture?.url ? (
                              <img
                                src={notification.sender.profilePicture.url}
                                alt={notification.sender.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {notification.sender?.firstName?.[0] || "?"}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 leading-relaxed">
                                  <span className="font-medium">
                                    {notification.sender?.firstName} {" "}
                                    {notification.sender?.lastName}
                                  </span>{" "}
                                  {NOTIFICATION_MESSAGES[notification.type] ||
                                    "sent you a notification"}
                                </p>

                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <IoTimeOutline className="h-3 w-3" />
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </span>

                                  {notification.status === "unread" && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(
                                  showActions === notification._id
                                    ? null
                                    : notification._id
                                );
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <BsThreeDotsVertical className="h-4 w-4 text-gray-400" />
                            </button>

                            {showActions === notification._id && (
                              <div className="absolute right-2 top-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                {notification.status === "unread" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification._id);
                                      setShowActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <IoCheckmarkDoneOutline className="h-4 w-4" />
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {hasMore && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Load more notifications"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
