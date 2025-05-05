import { ChatRequest, ChatResponse, User } from './schema';

export const API_ENDPOINTS = {
  CHAT: '/chat',
  MISSIONS: '/missions',
  USER: '/user',
  SESSIONS: '/sessions',
};

export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN_VOCABULARY = 'FORBIDDEN_VOCABULARY',
}

export class ApiError extends Error {
  type: ApiErrorType;
  status: number | undefined;
  details?: unknown;

  constructor(
    message: string,
    type: ApiErrorType,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.type = type;
    this.status = status;
    this.details = details;
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
        Authorization: 'Bearer anonymous',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);

    if (!response.ok) {
      let errorType = ApiErrorType.SERVER_ERROR;
      let errorDetails: unknown;

      // Try to parse error response as JSON to get more details
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = response.statusText || 'Unknown error';
      }

      if (response.status === 401) {
        errorType = ApiErrorType.UNAUTHORIZED;
      } else if (response.status === 400) {
        errorType = ApiErrorType.VALIDATION_ERROR;
      } else if (response.status === 403) {
        errorType = ApiErrorType.FORBIDDEN_VOCABULARY;
      }

      throw new ApiError(
        `API error: ${JSON.stringify(errorDetails)}`,
        errorType,
        response.status,
        errorDetails
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Fetch error:', error);

    throw new ApiError(
      `Network error: ${(error as Error).message || 'Unknown error'}`,
      ApiErrorType.NETWORK_ERROR,
      undefined,
      error
    );
  }
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
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

export interface UserUpdateRequest {
  userId: string;
  ageLevel?: number;
}

export interface UserResponse {
  id: string;
  ageLevel: number;
  updated?: boolean;
}

export async function getUser(userId: string): Promise<UserResponse> {
  return fetchApi<UserResponse>(`${API_ENDPOINTS.USER}?userId=${userId}`);
}

export async function updateUser(
  request: UserUpdateRequest
): Promise<UserResponse> {
  return fetchApi<UserResponse>(API_ENDPOINTS.USER, 'POST', request);
}

export interface SessionListRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface SessionDetails {
  id: string;
  startedAt: string;
  endedAt: string | null;
  missionType: string;
  messageCount: number;
  totalScore: number;
}

export interface SessionListResponse {
  sessions: SessionDetails[];
  totalCount: number;
}

export interface SessionExportRequest {
  sessionId: string;
  format?: 'json' | 'csv' | 'txt';
}

export interface SessionExportResponse {
  sessionId: string;
  exportUrl: string;
  format: string;
}

export async function getSessions(
  request: SessionListRequest
): Promise<SessionListResponse> {
  const { userId, limit = 10, offset = 0 } = request;
  return fetchApi<SessionListResponse>(
    `${API_ENDPOINTS.SESSIONS}?userId=${userId}&limit=${limit}&offset=${offset}`
  );
}

export async function exportSession(
  request: SessionExportRequest
): Promise<SessionExportResponse> {
  return fetchApi<SessionExportResponse>(
    `${API_ENDPOINTS.SESSIONS}/export`,
    'POST',
    request
  );
}
