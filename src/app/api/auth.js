import { axiosPublicApi } from "@/config/request";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const signUpApi = async (data) => {
  try {
    const response = await axiosPublicApi.post("/users/signup", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signInApi = createAsyncThunk(
  "users/signIn",
  async (data, thunkApi) => {
    try {
      const reponse = await axiosPublicApi.post("/users/signin", data);
      const token = reponse.data.token;
      const refreshToken = reponse.data.refreshToken;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(reponse.data.data));
        return { ...reponse?.data?.data, token, refreshToken };
      }
      return thunkApi.rejectWithValue("Token not found");
    } catch (error) {
      if (error.response && error.response.data) {
        return thunkApi.rejectWithValue(error.response.data.message);
      }
      return thunkApi.rejectWithValue(error.message);
    }
  }
);

export const verifyEmailApi = async (email, code) => {
  try {
    const response = await axiosPublicApi.post("/users/verify-email", {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resendVerificationEmailApi = async (email) => {
  try {
    const response = await axiosPublicApi.post("/users/resend-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
