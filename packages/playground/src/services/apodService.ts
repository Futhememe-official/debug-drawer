import type { ApiError, ApodResponse } from "../types/api";

const BASE_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = import.meta.env.VITE_NASA_API_KEY; // Replace with your key for higher rate limits

export async function fetchApod(date?: string): Promise<ApodResponse> {
  const params = new URLSearchParams({ api_key: API_KEY });
  if (date) params.append("date", date);

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.msg || body?.error?.message || body?.message;
    } catch {
      // ignore parse errors
    }

    const error: ApiError = {
      status: response.status,
      message: getErrorMessage(response.status),
      detail,
    };
    throw error;
  }

  return response.json();
}

export async function fetchApodRange(
  startDate: string,
  endDate: string,
): Promise<ApodResponse[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.msg || body?.error?.message;
      // eslint-disable-next-line no-empty
    } catch {}

    const error: ApiError = {
      status: response.status,
      message: getErrorMessage(response.status),
      detail,
    };
    throw error;
  }

  return response.json();
}

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
    503: "Service Unavailable",
  };
  return messages[status] ?? `HTTP Error ${status}`;
}
