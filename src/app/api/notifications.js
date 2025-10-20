import { axiosPrivateApi } from "@/config/request";

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await axiosPrivateApi.get("/notifications", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axiosPrivateApi.put(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosPrivateApi.put("/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosPrivateApi.get("/notifications?limit=1");
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },
};
