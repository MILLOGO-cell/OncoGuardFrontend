import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = new AxiosHeaders(config.headers);
        (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    toast.error(error.message || "Erreur de requête");
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    let message = "Erreur réseau";
    if (error.response) {
      const data = error.response.data as any;
      message = data?.detail || data?.message || `Erreur ${error.response.status}`;
    } else if (error.message) {
      message = error.message;
    }
    if (typeof window !== "undefined") toast.error(message);
    return Promise.reject(error);
  }
);

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient.get<T>(url, config);
  return data;
};

export const post = async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
};

export const put = async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
};

export default apiClient;