import { axiosPrivateApi } from "@/config/request";

export const SendFriendRequest = async (data) => {
  try {
    const response = await axiosPrivateApi.post("/friends", {
      receiverId: data.receiverId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error sending friend request:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const GetFriendRequests = async (page = 1, limit = 10, type = "all") => {
  try {
    const response = await axiosPrivateApi.get("/friends", {
      params: { page, limit, type },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching friend requests:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const AcceptFriendRequest = async (requestId) => {
  try {
    const response = await axiosPrivateApi.patch(`/friends/${requestId}`, {
      status: "accepted",
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error accepting friend request:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const RejectFriendRequest = async (requestId) => {
  try {
    const response = await axiosPrivateApi.patch(`/friends/${requestId}`, {
      status: "rejected",
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error rejecting friend request:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const CancelFriendRequest = async (requestId) => {
  try {
    const response = await axiosPrivateApi.delete(`/friends/${requestId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error cancelling friend request:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const GetFriends = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axiosPrivateApi.get("/friends/friends", {
      params: { page, limit, search },
    });
    return {
      data: response.data?.friends || [],
      page: response.data?.pagination?.page || page,
      limit: response.data?.pagination?.limit || limit,
      hasMore: response.data?.pagination?.hasMore || false,
    };
  } catch (error) {
    console.error(
      "Error fetching friends:",
      error?.response?.data || error.message
    );
    return { data: [], page, limit, hasMore: false };
  }
};

export const GetReceivedRequests = async (page = 1, limit = 10) => {
  try {
    const response = await GetFriendRequests(page, limit, "received");
    return {
      data: response?.requests || [],
      page: response?.pagination?.page || page,
      limit: response?.pagination?.limit || limit,
      hasMore: response?.pagination?.hasMore || false,
    };
  } catch (error) {
    console.error(
      "Error fetching received requests:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const GetSentRequests = async (page = 1, limit = 10) => {
  try {
    const response = await GetFriendRequests(page, limit, "sent");
    return {
      data: response?.requests || [],
      page: response?.pagination?.page || page,
      limit: response?.pagination?.limit || limit,
      hasMore: response?.pagination?.hasMore || false,
    };
  } catch (error) {
    console.error(
      "Error fetching sent requests:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

export const searchUsersApi = async (
  query,
  page = 1,
  limit = 10,
  relationship = "all"
) => {
  try {
    const response = await axiosPrivateApi.get("/users/search", {
      params: { q: query, page, limit, relationship },
    });
    return {
      data: response.data?.data?.users || [],
      page: response.data?.pagination?.page || page,
      limit: response.data?.pagination?.limit || limit,
      totalPages: response.data?.pagination?.totalPages || 1,
      hasMore: response.data?.pagination?.hasMore || false,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return { data: [], page, limit, totalPages: 1, hasMore: false };
  }
};
