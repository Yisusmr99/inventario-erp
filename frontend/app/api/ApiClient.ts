interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

interface RequestConfig extends RequestInit {
    timeout?: number;
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor(baseURL: string = 'http://localhost:3000/api', timeout: number = 10000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        const { timeout = this.timeout, ...requestConfig } = config;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const url = `${this.baseURL}${endpoint}`;

        const defaultConfig: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...requestConfig.headers,
            },
            signal: controller.signal,
            ...requestConfig,
        };

        try {
            const response = await fetch(url, defaultConfig);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }

            throw new Error('Network error occurred');
        }
    }

    async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default ApiClient;
