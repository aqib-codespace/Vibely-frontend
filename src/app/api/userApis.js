import { axiosPrivateApi } from "@/config/request";
import { verify } from "crypto";

export const getAllUsersApi = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get("/users/all-users", {
      params: { page, limit },
    });

    return {
      data: response.data?.data?.users || [],
      totalPages: response.data?.data?.totalPages || 1,
      page: response.data?.data?.page || page,
      hasMore: response.data?.data?.hasMore || false,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], totalPages: 1, page: page, hasMore: false };
  }
};

export const updateUserProfileApi = async (profileData) => {
  try {
    const response = await axiosPrivateApi.put(
      `/users/update-user`,
      profileData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProfilePictureApi = async (formData) => {
  try {
    const response = await axiosPrivateApi.post(
      `/users/profile-picture`,
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

export const uploadCoverPhotoApi = async (formData) => {
  try {
    const response = await axiosPrivateApi.post(
      `/users/cover-image`,
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

export const getUserByIdApi = async (userId) => {
  try {
    const response = await axiosPrivateApi.get(`/users/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchFriendsAndChatsApi = async (query, page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get(
      "/users/search-friends-messages",
      {
        params: { q: query, page, limit },
      }
    );
    console.log("Search response:", response.data);
    return response.data?.data || { friends: [], chats: [] };
  } catch (error) {
    console.error("Error searching friends and chats:", error);
    return { friends: [], chats: [] };
  }
};

export const forgetPasswordApi = async (data) => {
  try {
    const response = await axiosPrivateApi.post(`/users/forgot-password`, {
      email: data.email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtpApi = async (data) => {
  try {
    const response = await axiosPrivateApi.post(
      `/users/verify-reset-code`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPasswordApi = async (data) => {
  try {
    const response = await axiosPrivateApi.post(`/users/reset-password`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserStatsApi = async (userId) => {
  try {
    const response = await axiosPrivateApi.get(`/users/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

export const getCurrentUserStatsApi = async () => {
  try {
    const response = await axiosPrivateApi.get(`/users/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user stats:", error);
    throw error;
  }
};

export const changePasswordApi = async (data) => {
  try {
    const response = await axiosPrivateApi.put(`/users/change-password`, data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
