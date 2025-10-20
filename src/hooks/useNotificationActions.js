import { useNotifications } from "@/contexts/NotificationContext";
import { NOTIFICATION_TYPE } from "@/constants/notifications";

export const useNotificationActions = () => {
  const { fetchNotifications } = useNotifications();

  // Trigger notification refetch when a new notification might have been created
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Helper functions for different notification types
  const notifyFriendRequest = (friendId) => {
    // This would typically be called after sending a friend request
    setTimeout(refreshNotifications, 1000); // Small delay to ensure backend processing
  };

  const notifyFriendAccepted = (friendId) => {
    // This would typically be called after accepting a friend request
    setTimeout(refreshNotifications, 1000);
  };

  const notifyPostLiked = (postId) => {
    // This would typically be called after liking a post
    setTimeout(refreshNotifications, 1000);
  };

  const notifyPostComment = (postId) => {
    // This would typically be called after commenting on a post
    setTimeout(refreshNotifications, 1000);
  };

  const notifyNewMessage = (chatId) => {
    // This would typically be called after sending a message
    setTimeout(refreshNotifications, 1000);
  };

  const notifyMention = (postId) => {
    // This would typically be called after mentioning someone
    setTimeout(refreshNotifications, 1000);
  };

  return {
    refreshNotifications,
    notifyFriendRequest,
    notifyFriendAccepted,
    notifyPostLiked,
    notifyPostComment,
    notifyNewMessage,
    notifyMention,
  };
};
