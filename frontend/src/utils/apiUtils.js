// src/utils/apiUtils.js
export const BACKEND_URL = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_BACKEND_CLOUD_URL 
    : import.meta.env.VITE_BACKEND_LOCAL_URL;

export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                return null;
            }

            if (response.status === 401) {
                throw new Error('Unauthorized');
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => 
                setTimeout(resolve, Math.pow(2, i) * 1000)
            );
        }
    }
};

export const checkAuthStatus = async () => {
    try {
        const data = await fetchWithRetry(`${BACKEND_URL}/checkAuth`);
        return { isAuthenticated: true, user: data.user };
    } catch (error) {
        return { isAuthenticated: false, user: null };
    }
};