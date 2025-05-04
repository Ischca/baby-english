import { ChatRequest, ChatResponse } from './schema';

export const API_ENDPOINTS = {
  CHAT: '/chat',
  MISSIONS: '/missions'
};

export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN_VOCABULARY = 'FORBIDDEN_VOCABULARY'
}

export class ApiError extends Error {
  type: ApiErrorType;
  status: number | undefined;
  
  constructor(message: string, type: ApiErrorType, status?: number) {
    super(message);
    this.type = type;
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<T> {
  const baseUrl = 'http://127.0.0.1:54321/functions/v1';
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      let errorType = ApiErrorType.SERVER_ERROR;
      
      if (response.status === 401) {
        errorType = ApiErrorType.UNAUTHORIZED;
      } else if (response.status === 400) {
        errorType = ApiErrorType.VALIDATION_ERROR;
      } else if (response.status === 403) {
        errorType = ApiErrorType.FORBIDDEN_VOCABULARY;
      }
      
      throw new ApiError(
        `API error: ${response.statusText}`,
        errorType,
        response.status
      );
    }
    
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      `Network error: ${(error as Error).message}`,
      ApiErrorType.NETWORK_ERROR
    );
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return fetchApi<ChatResponse>(API_ENDPOINTS.CHAT, 'POST', request);
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  vocabulary: string[];
}

export interface MissionsResponse {
  missions: Mission[];
}

export async function getMissions(): Promise<MissionsResponse> {
  return fetchApi<MissionsResponse>(API_ENDPOINTS.MISSIONS);
}
