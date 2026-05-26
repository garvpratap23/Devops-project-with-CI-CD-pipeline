// User type
export interface User {
  id: number;
  email: string;
}

// Task type
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  user?: User;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Task stats
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// WebSocket event types
export interface SocketTaskEvent {
  event: string;
  payload: Task | { id: number };
  timestamp: string;
}
