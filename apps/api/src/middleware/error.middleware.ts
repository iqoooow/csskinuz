import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (err.message.includes('yetarli emas') ? 402 : 400);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'BAD_REQUEST',
      message: err.message || 'Kutilmagan xatolik yuz berdi',
    },
  });
}
