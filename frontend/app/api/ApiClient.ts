// app/api/ApiClient.ts

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

            // --- CORRECCIÓN APLICADA AQUÍ ---
            // Se intenta leer el cuerpo de la respuesta (JSON) sin importar si fue exitosa o no.
            // Esto nos permite capturar los mensajes de error específicos del backend.
            const responseBody = await response.json();

            if (!response.ok) {
                // Si la respuesta no es exitosa, lanzamos un error usando el mensaje del backend.
                // Si no hay mensaje, usamos uno genérico.
                throw new Error(responseBody.message || `HTTP error! status: ${response.status}`);
            }

            // Si la respuesta fue exitosa, la devolvemos como antes.
            return responseBody;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('La solicitud tardó demasiado en responder.');
                }
                // Re-lanzamos el error (que ahora puede contener el mensaje del backend).
                throw error;
            }

            throw new Error('Ocurrió un error de red.');
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

// Se crea y exporta una única instancia para ser usada en toda la aplicación.
export const apiClient = new ApiClient();
export default ApiClient;
