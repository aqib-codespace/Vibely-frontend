import { axiosPrivateApi } from "@/config/request";

export const CreatePostApi = async (postData) => {
  try {
    const response = await axiosPrivateApi.post("/feed/create-post", postData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllPostsApi = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get("/feed/all-posts", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostByIdApi = async (postId) => {
  try {
    const response = await axiosPrivateApi.get(`/feed/post/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostsByUserIdApi = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get(`/feed/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFeedPostApi = async (postId, updatedData) => {
  try {
    const response = await axiosPrivateApi.post(
      `/feed/update-post/${postId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likePostApi = async (postId) => {
  try {
    const response = await axiosPrivateApi.post(`/feed/like/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UnLikePostApi = async (postId) => {
  try {
    const response = await axiosPrivateApi.post(`/feed/unlike/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePostApi = async (postId) => {
  try {
    const response = await axiosPrivateApi.delete(`/feed/delete/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
