import axios, { InternalAxiosRequestConfig, AxiosRequestConfig } from "axios";
import config from "../utils/config";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  authenticate?: boolean;
}

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (config.authenticate && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor that returns only response.data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    toast.error(
      error.response?.data?.message || "Error Occurred! Please try again!"
    );
    return Promise.reject(error);
  }
);

// ✅ Properly type the returned Axios instance to match unwrapped `data`

type DataOnlyAxiosInstance = {
  get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse>;
  post<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse>;
  put<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse>;
  delete<TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse>;
};

const api = axiosInstance as DataOnlyAxiosInstance;
export default api;
