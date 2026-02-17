import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string;      // Multi-tenant: which organization user belongs to
  buildingId?: string;
  tenantPlan?: string;   // Optional: tenant's subscription plan
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true };
  }

  /**
   * Check if user has required role
   */
  static hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      TENANT: 1,
      MAINTENANCE: 2,
      MANAGER: 3,
      ADMIN: 4,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, purpose: 'password_reset' },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Verify password reset token
   */
  static verifyResetToken(token: string): { userId: string; email: string } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any;
      if (payload.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
      return { userId: payload.userId, email: payload.email };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}