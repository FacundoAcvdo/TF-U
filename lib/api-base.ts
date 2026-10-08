// Cliente (browser) y servidor (route handlers) necesitan hosts distintos
// cuando todo corre en Docker:
// - browser (fuera de Docker) -> http://localhost:8080
// - servidor Next (dentro de Docker) -> http://api-gateway:8080
// NEXT_PUBLIC_* se embebe en el build (cliente), API_BASE_SERVER es runtime (servidor).
export const API_BASE: string =
  typeof window === "undefined"
    ? (process.env.API_BASE_SERVER ??
      process.env.NEXT_PUBLIC_API_BASE ??
      "http://localhost:8080")
    : (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080");
