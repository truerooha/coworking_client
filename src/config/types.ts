// Типы для API ответов

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface AuthCheckResponse {
  allowed: boolean;
  isAdmin: boolean;
  name?: string;
  surname?: string;
}

export interface User {
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
}

export interface CreateUserRequest {
  username: string;
  isAdmin: boolean;
}

export interface CreateUserResponse {
  message: string;
  user: {
    username: string;
    isAdmin: boolean;
  };
}

export interface Room {
  id: string;
  name: string;
  image: string;
  capacity: number;
  description: string;
  isOccupied: boolean;
  currentBooking?: {
    user: string;
    startTime: string;
    endTime: string;
  };
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'cancelled';
}
