"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "./SocketContext";
import { notificationApi } from "@/app/api/notifications";
import { NOTIFICATION_STATUS } from "@/constants/notifications";
import notificationSound from "@/utils/notificationSound";
import toast from "react-hot-toast";
import { NOTIFICATION_TYPE } from "@/constants/notifications";
import Link from "next/link";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { socketManager, isConnected } = useSocketContext();
  const currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchNotifications = useCallback(
    async (page = 1, reset = false) => {
      if (!isAuthenticated) return;

      console.log("🔄 Fetching notifications - Page:", page, "Reset:", reset);
      setLoading(true);
      try {
        const response = await notificationApi.getNotifications(page, 20);
        const newNotifications = response.data || [];

        console.log(
          "📥 Received notifications from API:",
          newNotifications.length
        );

        setNotifications((prev) => {
          const result = reset
            ? newNotifications
            : [...prev, ...newNotifications];
          console.log("📊 Total notifications after update:", result.length);
          return result;
        });
        setUnreadCount(response.unreadCount || 0);
        setHasMore(newNotifications.length === 20);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                status: NOTIFICATION_STATUS.READ,
                readAt: new Date(),
              }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          status: NOTIFICATION_STATUS.READ,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Handle real-time notifications via socket
  useEffect(() => {
    if (isConnected && socketManager) {
      const handleNewNotification = (notification) => {
        console.log("📨 Received new notification:", notification);

        // Prevent duplicates by checking if notification already exists
        setNotifications((prev) => {
          const exists = prev.some((n) => n._id === notification._id);
          if (exists) {
            console.log("🔄 Notification already exists, skipping duplicate");
            return prev;
          }
          return [notification, ...prev];
        });

        setUnreadCount((prev) => prev + 1);

        // Play notification sound
        if (notificationSound.isEnabled()) {
          notificationSound.playNotificationSound();
        }

        try {
          if (notification.type === NOTIFICATION_TYPE.WELCOME) {
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-white text-black rounded-lg shadow-lg border border-gray-200 p-4 flex gap-3 items-start`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-semibold text-lg">
                  V
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Welcome to Vibely</h4>
                  <p className="text-xs text-gray-700 mt-1">
                    Welcome to Vibely, where thoughtful connections meet meaningful
                    conversations. Start by completing your profile, follow a
                    few creators, and share your first post to get discovered.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href="/profile-setting"
                      className="text-xs border border-black px-3 py-1 rounded-md hover:bg-black hover:text-white transition-colors"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Complete profile
                    </Link>

                    <Link
                      href="/"
                      className="text-xs text-gray-700 underline"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Explore feed
                    </Link>
                  </div>
                </div>
              </div>
            ), { duration: 12000 });
          }
        } catch (err) {
          console.error("Error showing welcome toast:", err);
        }
      };

      socketManager.onNotification(handleNewNotification);

      return () => {
        socketManager.offNotification(handleNewNotification);
      };
    }
  }, [isConnected, socketManager]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log(
        "🔄 Fetching initial notifications for user:",
        currentUser.firstName
      );
      fetchNotifications(1, true);
    }
  }, [isAuthenticated, currentUser?.id]); // Only depend on user ID to prevent excessive calls

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications: () => fetchNotifications(1, true),
    loadMore,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
