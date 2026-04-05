import { setupWorker } from "msw/browser";

// Worker inicia sem handlers — o DebugDrawer injeta os handlers dinamicamente
// via useRegisterMockEndpoints conforme as páginas são montadas.
export const worker = setupWorker();
