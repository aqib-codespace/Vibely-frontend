"use client";
import React, { useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_ICONS,
} from "@/constants/notifications";
import {
  IoTimeOutline,
  IoArrowBack,
  IoCheckmarkDoneOutline,
} from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Layout from "@/app/layout/layout";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (notification) => {
    if (notification.status === "unread") {
      await markAsRead(notification._id);
    }

    if (notification.type === NOTIFICATION_TYPE.NEW_MESSAGE) {
      router.push(`/chat/${notification.relatedId}`);
    } else if (
      notification.type === NOTIFICATION_TYPE.POST_LIKED ||
      notification.type === NOTIFICATION_TYPE.POST_COMMENT
    ) {
      router.push(`/post/${notification.relatedId}`);
    } else if (notification.type === NOTIFICATION_TYPE.VIDEO_LIKED) {
      router.push(`/watch-videos/${notification.relatedId}`);
    } else if (notification.type === NOTIFICATION_TYPE.FRIEND_REQUEST) {
      router.push("/friends");
    }
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {/* <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoArrowBack className="h-5 w-5 text-gray-700" />
              </button> */}
              <h1 className="text-lg font-semibold text-gray-900">
                Notifications
              </h1>
            </div>

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
        </div>

        <div className="max-w-2xl mx-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="font-medium text-lg mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-gray-400">
                  When you get notifications, they all show up here
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white">
              {notifications
                .filter(
                  (notification, index, self) =>
                    index === self.findIndex((n) => n._id === notification._id)
                )
                .map((notification, index) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
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
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                            {notification.sender?.firstName?.[0] || "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 leading-relaxed">
                              <span className="font-medium">
                                {notification.sender?.firstName}{" "}
                                {notification.sender?.lastName}
                              </span>{" "}
                              {NOTIFICATION_MESSAGES[notification.type] ||
                                "sent you a notification"}
                            </p>

                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <IoTimeOutline className="h-3 w-3" />
                                {formatNotificationTime(notification.createdAt)}
                              </span>

                              {notification.status === "unread" && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                          </div>

                          <div className="ml-2 text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {hasMore && (
                <div className="p-4 text-center border-t border-gray-100">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {loading ? "Loading..." : "Load more notifications"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
