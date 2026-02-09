import axios from "axios";

if (!import.meta.env.VITE_API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export default api;
