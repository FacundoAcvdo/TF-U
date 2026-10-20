// Cliente (browser) y servidor (route handlers) necesitan hosts distintos
// cuando todo corre en Docker:
// - browser (fuera de Docker) -> http://localhost:8080
// - servidor Next (dentro de Docker) -> http://api-gateway:8080
// NEXT_PUBLIC_* se embebe en el build (cliente), API_BASE_SERVER es runtime (servidor).
export const API_BASE: string =
  typeof window === "undefined"
    ? (process.env.API_BASE_SERVER ?? "http://api-gateway:7500")
    : "";
