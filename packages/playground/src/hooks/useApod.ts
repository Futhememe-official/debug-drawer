import { useCallback, useState } from "react";
import { fetchApod } from "../services/apodService";
import type { ApiError, ApodResponse, FetchState } from "../types/api";

export function useApod() {
  const [state, setState] = useState<FetchState<ApodResponse>>({
    status: "idle",
  });

  const fetch = useCallback(async (date?: string) => {
    setState({ status: "loading" });
    try {
      const data = await fetchApod(date);
      setState({ status: "success", data });
    } catch (err) {
      const error = err as ApiError;
      setState({ status: "error", error });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, fetch, reset };
}
