import { axiosPrivateApi } from "@/config/request";

export const uploadVideo = async (videoData, onProgress) => {
  try {
    const formData = new FormData();
    formData.append("title", videoData.title);
    formData.append("description", videoData.description || "");
    formData.append("video", videoData.file);

    const response = await axiosPrivateApi.post("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

export const fetchAllVideos = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get("/videos/get-all", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const toggleVideoLikesApi = async (videoId) => {
  try {
    const response = await axiosPrivateApi.post(`/videos/like/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling video like:", error);
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle video like",
    };
  }
};

export const toggleVideoSaveApi = async (videoId) => {
  try {
    const response = await axiosPrivateApi.post(`/videos/save/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling video save:", error);
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle video save",
    };
  }
};

export const fetchVideoById = async (videoId) => {
  try {
    const response = await axiosPrivateApi.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    throw error;
  }
};

export const fetchUsersSavedVideos = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get(`/videos/saved/user/${userId}`, {
      params: { page, limit },
    });
    console.log("Fetched user's saved videos:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user's saved videos:", error);
    throw error;
  }
};

export const deleteVideoById = async (videoId) => {
  try {
    const response = await axiosPrivateApi.delete(`/videos/delete/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting video by ID:", error);
    throw error;
  }
};
