import type {
  CountryConfigSummary,
  MatchingResult,
  ReadinessResult,
  SkillsProfile,
} from "./types";

const BASE = "/api";

async function post<T>(path: string, body: unknown, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export const api = {
  countries: (): Promise<CountryConfigSummary[]> => get("/config/countries"),
  readiness: (profile: SkillsProfile): Promise<ReadinessResult> =>
    post("/analysis/readiness", profile),
  matching: (profile: SkillsProfile, policymaker = false): Promise<MatchingResult> =>
    post("/analysis/matching", profile, policymaker ? { policymaker_view: "true" } : undefined),
};
