import axios from "axios";

if (!import.meta.env.VITE_API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Retry logic for Render cold starts (free tier returns 404 while spinning up)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Only retry on 404 or network errors (cold start indicators), max 2 retries
        if (
            (error.response?.status === 404 || !error.response) &&
            (!config._retryCount || config._retryCount < 2)
        ) {
            config._retryCount = (config._retryCount || 0) + 1;
            console.log(`Retrying request (${config._retryCount}/2): ${config.url}`);

            // Wait 3 seconds for Render to wake up
            await new Promise(resolve => setTimeout(resolve, 3000));
            return api(config);
        }

        // Handle 401 Unauthorized globally (session expired)
        if (error.response?.status === 401) {
            console.warn("Unauthorized: Clearing session and redirecting to login...");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

