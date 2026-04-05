/**
 * MSW Handlers — NASA APOD
 *
 * Instale o MSW: npm install msw --save-dev
 * Inicialize:    npx msw init public/ --save
 *
 * No main.tsx, descomente o bloco de inicialização do worker.
 */

import { http, HttpResponse } from "msw";

const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";

export const handlers = [
  http.get(NASA_APOD_URL, ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? "";

    if (date.includes("__msw_error_400__"))
      return HttpResponse.json(
        { msg: "Bad Request: date must be between Jun 16, 1995 and today." },
        { status: 400 }
      );

    if (date.includes("__msw_error_401__"))
      return HttpResponse.json(
        { error: { code: "API_KEY_INVALID", message: "An invalid api_key was supplied." } },
        { status: 401 }
      );

    if (date.includes("__msw_error_403__"))
      return HttpResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied for this resource." } },
        { status: 403 }
      );

    if (date.includes("__msw_error_404__"))
      return HttpResponse.json(
        { msg: "No data found for requested date." },
        { status: 404 }
      );

    if (date.includes("__msw_error_429__"))
      return HttpResponse.json(
        { error: { code: "OVER_RATE_LIMIT", message: "Rate limit exceeded. Try again later." } },
        { status: 429, headers: { "Retry-After": "3600" } }
      );

    if (date.includes("__msw_error_500__"))
      return HttpResponse.json(
        { msg: "Internal Server Error. Please try again later." },
        { status: 500 }
      );

    if (date.includes("__msw_error_503__"))
      return HttpResponse.json(
        { msg: "Service temporarily unavailable." },
        { status: 503 }
      );

    return undefined; // bypass — requisição real
  }),
];

// Handler de sucesso mockado (use no lugar dos reais em testes)
export const successHandler = http.get(NASA_APOD_URL, () =>
  HttpResponse.json({
    date: new Date().toISOString().split("T")[0],
    title: "Mocked: The Milky Way over the Sierra Nevada",
    explanation: "Mock MSW response for development/testing purposes.",
    url: "https://apod.nasa.gov/apod/image/2401/MilkyWay_Sierra_1024.jpg",
    hdurl: "https://apod.nasa.gov/apod/image/2401/MilkyWay_Sierra.jpg",
    media_type: "image",
    service_version: "v1",
    copyright: "MSW Mock",
  })
);
