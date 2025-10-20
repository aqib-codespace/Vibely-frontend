import { axiosPrivateApi } from "@/config/request";

export const accessOrCreateMarketplaceChatApi = async (sellerId, productId) => {
  try {
    const response = await axiosPrivateApi.post("/marketplace-chat/access", {
      sellerId,
      productId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMarketplaceChatsApi = async (page = 1, limit = 20) => {
  try {
    const response = await axiosPrivateApi.get("/marketplace-chat/chats", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendMarketplaceMessageApi = async (
  chatId,
  content,
  media = null,
  messageType = "text",
  replyTo = null,
  sharedProduct = null,
  offerDetails = null
) => {
  try {
    const formData = new FormData();
    formData.append("content", content || "");
    formData.append("chatId", chatId);
    formData.append("messageType", messageType);

    if (media) {
      if (Array.isArray(media)) {
        media.forEach((file) => {
          formData.append("media", file);
        });
      } else {
        formData.append("media", media);
      }
    }

    if (replyTo) {
      formData.append("replyTo", replyTo);
    }

    if (sharedProduct) {
      formData.append("sharedProduct", sharedProduct);
    }

    if (offerDetails) {
      formData.append("offerDetails", JSON.stringify(offerDetails));
    }

    const response = await axiosPrivateApi.post(
      "/marketplace-chat/send",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMarketplaceChatMessagesApi = async (
  chatId,
  page = 1,
  limit = 50
) => {
  try {
    const response = await axiosPrivateApi.get(
      `/marketplace-chat/${chatId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markMarketplaceChatMessagesAsReadApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.put(
      `/marketplace-chat/${chatId}/read`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMarketplaceMessageApi = async (
  messageId,
  deleteType = "forMe"
) => {
  try {
    const response = await axiosPrivateApi.delete(
      `/marketplace-chat/message/${messageId}`,
      {
        data: { deleteType },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editMarketplaceMessageApi = async (messageId, content) => {
  try {
    const response = await axiosPrivateApi.put(
      `/marketplace-chat/message/${messageId}`,
      { content }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleMarketplaceMessageReactionApi = async (messageId, emoji) => {
  try {
    const response = await axiosPrivateApi.post(
      `/marketplace-chat/message/${messageId}/reaction`,
      { emoji }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const blockUserInMarketplaceChatApi = async (chatId, targetUserId) => {
  try {
    const response = await axiosPrivateApi.post(
      `/marketplace-chat/${chatId}/block`,
      { targetUserId }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveMarketplaceChatApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.post(
      `/marketplace-chat/${chatId}/archive`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchMarketplaceChatMessagesApi = async (
  chatId,
  query,
  page = 1,
  limit = 20
) => {
  try {
    const response = await axiosPrivateApi.get(
      `/marketplace-chat/${chatId}/search`,
      {
        params: { query, page, limit },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMarketplaceChatStatsApi = async (chatId) => {
  try {
    const response = await axiosPrivateApi.get(
      `/marketplace-chat/${chatId}/stats`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const globalSearchMarketplaceChatApi = async (
  query,
  page = 1,
  limit = 20
) => {
  try {
    const response = await axiosPrivateApi.get(
      `/marketplace-chat/search/global`,
      {
        params: { query, page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Marketplace chat global search failed:", error);
    return { data: [] };
  }
};
