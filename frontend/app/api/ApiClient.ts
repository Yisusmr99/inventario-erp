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

    constructor(baseURL: string = import.meta.env.VITE_BASE_URL ?? '', timeout: number = 10000) {
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

            let data: any = null;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            if (!response.ok) {
                // Si el backend envía un mensaje, lánzalo como error personalizado
                const errorMsg = data?.message || `HTTP error! status: ${response.status}`;
                const errorObj: any = new Error(errorMsg);
                errorObj.status = response.status;
                errorObj.data = data;
                throw errorObj;
            }

            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
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
