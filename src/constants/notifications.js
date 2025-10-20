export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: "friend_request",
  FRIEND_ACCEPTED: "friend_accepted",
  POST_LIKED: "post_liked",
  VIDEO_LIKED: "video_liked",
  NEW_MESSAGE: "new_message",
  WELCOME: "welcome",
  POST_COMMENT: "post_comment",
  MENTION: "mention",
};

export const NOTIFICATION_STATUS = {
  UNREAD: "unread",
  READ: "read",
};

export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPE.FRIEND_REQUEST]: "sent you a friend request",
  [NOTIFICATION_TYPE.FRIEND_ACCEPTED]: "accepted your friend request",
  [NOTIFICATION_TYPE.POST_LIKED]: "liked your post",
  [NOTIFICATION_TYPE.VIDEO_LIKED]: "liked your video",
  [NOTIFICATION_TYPE.NEW_MESSAGE]: "sent you a message",
  [NOTIFICATION_TYPE.POST_COMMENT]: "commented on your post",
  [NOTIFICATION_TYPE.MENTION]: "mentioned you in a post",
  [NOTIFICATION_TYPE.WELCOME]: "welcome to Vibely",
};

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPE.FRIEND_REQUEST]: "👤",
  [NOTIFICATION_TYPE.FRIEND_ACCEPTED]: "✅",
  [NOTIFICATION_TYPE.POST_LIKED]: "❤️",
  [NOTIFICATION_TYPE.VIDEO_LIKED]: "🎥",
  [NOTIFICATION_TYPE.NEW_MESSAGE]: "💬",
  [NOTIFICATION_TYPE.POST_COMMENT]: "💭",
  [NOTIFICATION_TYPE.MENTION]: "📢",
  [NOTIFICATION_TYPE.WELCOME]: "✨",
};
