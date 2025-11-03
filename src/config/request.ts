import axios from "axios";
import { redirect } from "next/navigation";
const BASE_URL = process.env.BACKEND_BASE_URL;
console.log("BASE_URL:", BASE_URL);
export const axiosPublicApi = axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivateApi = axios.create({
  baseURL: BASE_URL,
});

axiosPrivateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      redirect("/signin");
    }
    return Promise.reject(error);
  }
);
