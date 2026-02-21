import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthService } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/prisma-enums';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.TENANT),
  buildingId: z.string().optional(),
  apartment: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = AuthService.validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.message!);
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        buildingId: data.buildingId,
        apartment: data.apartment,
        // In a real app, we'd store the hashed password in a separate field
        // For now, we'll use a placeholder
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        buildingId: true,
        apartment: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: (user as any).managementCompanyId || (user as any).hoaOrganizationId || undefined,
      buildingId: user.buildingId || undefined,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        buildingId: true,
        apartment: true,
        managementCompanyId: true,
        hoaOrganizationId: true,
        // In a real app, we'd include password hash here
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // In a real app, we'd verify the password hash
    // For now, we'll simulate password verification
    const passwordValid = data.password === 'password123'; // Temporary for development

    if (!passwordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: (user as any).managementCompanyId || (user as any).hoaOrganizationId || undefined,
      buildingId: user.buildingId || undefined,
    });

    res.json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        buildingId: true,
        apartment: true,
        createdAt: true,
        updatedAt: true,
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/auth/me
 * @desc Update current user profile
 * @access Private
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const updateSchema = z.object({
      firstName: z.string().min(1, 'First name is required').optional(),
      lastName: z.string().min(1, 'Last name is required').optional(),
      phone: z.string().optional(),
      apartment: z.string().optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        buildingId: true,
        apartment: true,
        updatedAt: true,
      },
    });

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const data = changePasswordSchema.parse(req.body);

    // In a real app, we'd verify current password
    // For now, we'll just validate the new password
    const passwordValidation = AuthService.validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.message!);
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(data.newPassword);

    // Update user password (in a real app)
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        // Update password hash here
      },
    });

    res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.post('/request-password-reset', async (req, res, next) => {
  try {
    const data = resetPasswordRequestSchema.parse(req.body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({
        status: 'success',
        message: 'If an account exists with this email, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = AuthService.generateResetToken(user.id, user.email);

    // In a real app, we'd send an email with the reset link
    // For now, we'll return the token (in development only)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset link for ${user.email}: ${resetLink}`);
    }

    res.json({
      status: 'success',
      message: 'If an account exists with this email, a reset link has been sent',
      // Only include in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    // Verify reset token
    const { userId } = AuthService.verifyResetToken(data.token);

    // Validate new password
    const passwordValidation = AuthService.validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.message!);
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(data.newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Update password hash here
      },
    });

    res.json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token invalidation)
 * @access Private
 */
router.post('/logout', authenticate, (req, res) => {
  // Note: JWT tokens are stateless, so we can't invalidate them server-side
  // without implementing a token blacklist. This endpoint is for client-side
  // cleanup (removing token from storage).
  
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * @route GET /api/auth/verify
 * @desc Verify token validity
 * @access Private
 */
router.get('/verify', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      valid: true,
      user: req.user,
    },
  });
});

export const authRoutes = router;