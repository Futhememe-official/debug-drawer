import { http, HttpResponse } from "msw";
import type { PageMockConfig } from "@withgus/debug";

const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";

// ─── Handlers por cenário ─────────────────────────────────────────────────────

export const apodHandlers = {
  success: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json({
        date: new Date().toISOString().split("T")[0],
        title: "The Milky Way over the Sierra Nevada",
        explanation:
          "A mocked success response from MSW. In the real API this would return an actual NASA astronomy picture of the day with a full explanation of the celestial object or phenomenon depicted.",
        url: "https://apod.nasa.gov/apod/image/2401/MilkyWay_Sierra_1024.jpg",
        hdurl: "https://apod.nasa.gov/apod/image/2401/MilkyWay_Sierra.jpg",
        media_type: "image",
        service_version: "v1",
        copyright: "Mock · MSW",
      })
    ),

  error: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { msg: "Internal Server Error. Please try again later." },
        { status: 500 }
      )
    ),

  loading: () =>
    http.get(NASA_APOD_URL, async () => {
      await new Promise((r) => setTimeout(r, 999_999));
      return HttpResponse.json({}, { status: 200 });
    }),

  not_found: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { msg: "No data found for requested date." },
        { status: 404 }
      )
    ),

  forbidden: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied for this resource." } },
        { status: 403 }
      )
    ),

  unauthorized: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { error: { code: "API_KEY_INVALID", message: "An invalid api_key was supplied." } },
        { status: 401 }
      )
    ),

  rate_limited: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { error: { code: "OVER_RATE_LIMIT", message: "Rate limit exceeded. Try again later." } },
        { status: 429, headers: { "Retry-After": "3600" } }
      )
    ),

  bad_request: () =>
    http.get(NASA_APOD_URL, () =>
      HttpResponse.json(
        { msg: "Bad Request: date must be between Jun 16, 1995 and today." },
        { status: 400 }
      )
    ),

  network_error: () =>
    http.get(NASA_APOD_URL, () => HttpResponse.error()),
};

// ─── PageMockConfig — formato exato do @withgus/debug ────────────────────────

export const apodPageConfig: PageMockConfig = {
  pageId: "/",

  endpoints: [
    {
      id: "apod-get",
      method: "GET",
      path: NASA_APOD_URL,
      selectedScenario: "success",
      options: [
        {
          id: "success",
          label: "✅ Success",
          description: "Retorna uma imagem APOD mockada com status 200.",
          statusCode: 200,
          scenario: "success",
        },
        {
          id: "error",
          label: "💥 500 — Server Error",
          description: "Simula uma falha interna no servidor da NASA.",
          statusCode: 500,
          scenario: "error",
        },
        {
          id: "loading",
          label: "⏳ Loading infinito",
          description: "Suspende a requisição indefinidamente (testa skeleton).",
          statusCode: null,
          scenario: "loading",
        },
        {
          id: "not_found",
          label: "🌌 404 — Not Found",
          description: "Nenhuma imagem encontrada para a data.",
          statusCode: 404,
          scenario: "not_found",
        },
        {
          id: "forbidden",
          label: "🚫 403 — Forbidden",
          description: "Sem permissão para acessar o recurso.",
          statusCode: 403,
          scenario: "forbidden",
        },
        {
          id: "unauthorized",
          label: "🔐 401 — Unauthorized",
          description: "API key ausente ou inválida.",
          statusCode: 401,
          scenario: "unauthorized",
        },
        {
          id: "rate_limited",
          label: "⏱ 429 — Rate Limited",
          description: "Limite de requisições do DEMO_KEY atingido.",
          statusCode: 429,
          scenario: "rate_limited",
        },
        {
          id: "bad_request",
          label: "⚠ 400 — Bad Request",
          description: "Data fora do intervalo válido da API.",
          statusCode: 400,
          scenario: "bad_request",
        },
        {
          id: "network_error",
          label: "📡 Network Error",
          description: "Simula falha de rede (sem resposta).",
          statusCode: null,
          scenario: "network_error",
        },
      ],
    },
  ],

  handlers: {
    "apod-get": apodHandlers,
  },
};
