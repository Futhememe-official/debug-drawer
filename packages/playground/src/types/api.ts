export interface ApodResponse {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
  thumbnail_url?: string;
  service_version: string;
}

export type HttpErrorCode = 400 | 401 | 403 | 404 | 429 | 500 | 503;

export interface ApiError {
  status: HttpErrorCode | number;
  message: string;
  detail?: string;
}

export type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: ApiError };
