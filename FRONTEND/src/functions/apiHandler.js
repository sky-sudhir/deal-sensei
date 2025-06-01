import axios from "axios";
import { getToken } from "../imports/localStorage";
import BACKEND_URL from "../imports/baseUrl";
import { showToast } from "../utils/toast.jsx";

export default async function apiHandler(query) {
  const token = getToken();
  const { method = "GET", skipToken, contentType, data, params, url } = query;
  // Ensure we don't have double slashes in the URL
  const formattedUrl = url.startsWith('/') ? url.substring(1) : url;
  
  const config = {
    method: method,
    url: `${BACKEND_URL}${encodeURI(formattedUrl)}`,
    headers: {
      "Content-Type": contentType || "application/json",
      Authorization: skipToken ? "" : `Bearer ${token}`,
    },
    data: data,
    params: params,
  };
  
  console.log('API Request URL:', config.url);
  if (!token || skipToken) {
    config.headers.Authorization = "";
  }

  try {
    const response = await axios(config);
    const result = {
      data: response.data,
      status: response.status,
      success: true,
    };
    if (response.data?.message && method != "GET") {
      showToast.success(response.data.message);
    }
    return result;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    const status = error.response?.status || 500;

    // Only show toast for non-403 errors

    if (status === 500) {
      showToast.error(errorMessage);
    } else if (
      status === 403 ||
      status === 400 ||
      status === 404 ||
      status === 401
    ) {
      showToast.warn(errorMessage);
    }

    return {
      data: error.response?.data || error.message,
      status: status,
      success: false,
      error: errorMessage,
    };
  }
}
