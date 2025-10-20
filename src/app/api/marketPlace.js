import { axiosPrivateApi } from "@/config/request";

export const CreateProductApi = async (data) => {
  try {
    const response = await axiosPrivateApi.post(
      "/marketPlace/create-item",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const fetchAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get("/marketPlace/items", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await axiosPrivateApi.get(
      `/marketPlace/item/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const UpdateProductApi = async (productId, data) => {
  try {
    const response = await axiosPrivateApi.put(
      `/marketPlace/item/${productId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProductById = async (productId) => {
  try {
    const response = await axiosPrivateApi.delete(
      "/marketPlace/item/" + productId
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product by ID:", error);
    throw error;
  }
};

export const getUserProducts = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateApi.get("/marketPlace/user-items", {
      params: { userId, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user products:", error);
    throw error;
  }
};
