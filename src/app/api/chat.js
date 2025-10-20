import { axiosPrivateApi } from "@/config/request";

export const globalSearchApi = async (query, page = 1, limit = 20) => {
  try {
    const response = await axiosPrivateApi.get(`/chats/search/global`, {
      params: { query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Global search failed:", error);
    return { data: [] };
  }
};

export const createSingleChatApi = async (userId) => {
  try {
    const response = await axiosPrivateApi.post("/chats/chat", {
      userId: userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserChatsApi = async () => {
  try {
    const response = await axiosPrivateApi.get("/chats/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendChatMessageApi = async (
  chatId,
  content,
  file = null,
  replyTo = null,
  productData = null
) => {
  try {
    const formData = new FormData();
    formData.append("content", content || "");
    formData.append("chatId", chatId);

    if (file) {
      formData.append("media", file);
    }

    if (replyTo) {
      formData.append("replyTo", replyTo);
    }

    if (productData) {
      formData.append("productData", JSON.stringify(productData));
    }

    const response = await axiosPrivateApi.post("/chats/message", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatMessagesApi = async (chatId, page = 1, limit = 20) => {
  try {
    const response = await axiosPrivateApi.get(`/chats/messages/${chatId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteChatMessageApi = async (messageId) => {
  try {
    const response = await axiosPrivateApi.delete(
      `/chats/message/${messageId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editChatMessageApi = async (messageId, newContent) => {
  try {
    const response = await axiosPrivateApi.post(
      `/chats/message/edit/${messageId}`,
      {
        content: newContent,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAllMessagesInChatApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.delete(
      `/chats/messages/clear/${chatId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const reactToMessageApi = async (messageId, emoji) => {
  try {
    const response = await axiosPrivateApi.post(
      `/chats/message/reaction/${messageId}`,
      { emoji }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMessageForMeApi = async (messageId) => {
  try {
    const response = await axiosPrivateApi.delete(
      `/chats/message/${messageId}/for-me`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMessageForEveryoneApi = async (messageId) => {
  try {
    const response = await axiosPrivateApi.delete(
      `/chats/message/${messageId}/for-everyone`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setChatWallpaperApi = async (chatId, wallpaperData) => {
  try {
    const response = await axiosPrivateApi.put(
      `/chats/${chatId}/wallpaper`,
      wallpaperData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatWallpaperApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.get(`/chats/${chatId}/wallpaper`);
    console.log(response);
    return response.data.wallpaper;
  } catch (error) {
    throw error;
  }
};

export const removeChatWallpaperApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.delete(`/chats/${chatId}/wallpaper`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchMessagesApi = async (
  chatId,
  query,
  page = 1,
  limit = 20
) => {
  try {
    const response = await axiosPrivateApi.get(`/chats/messages/search`, {
      params: { chatId, query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
