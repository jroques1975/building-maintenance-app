import { UserRole } from './common';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  buildingId?: string;
  unitId?: string;
  unitNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface CreateUserDto {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  buildingId?: string;
  unitNumber?: string;
}

export interface UpdateUserDto {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  buildingId?: string;
  unitNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}