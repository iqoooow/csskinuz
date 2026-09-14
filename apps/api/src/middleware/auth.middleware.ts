import { Request, Response, NextFunction } from 'express';
import { AuthService, UserSession } from '../modules/auth/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: UserSession;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Avtorizatsiya talab etiladi' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const session = AuthService.verifyToken(token);
    req.user = session;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: error.message || 'Token yaroqsiz' },
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Tizimga kirish talab etiladi' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Ushbu amal uchun ruxsat berilmagan' },
      });
      return;
    }

    next();
  };
}
