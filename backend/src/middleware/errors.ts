import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const requestLogger: RequestHandler = (req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    console.info(JSON.stringify({ method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - started }));
  });
  next();
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: "Gönderilen bilgiler geçersiz.", fields: error.flatten().fieldErrors });
  console.error(JSON.stringify({ type: error instanceof Error ? error.name : "UnknownError" }));
  return res.status(500).json({ error: "Beklenmedik bir sorun oluştu." });
};
