import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error("API Error caught:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
