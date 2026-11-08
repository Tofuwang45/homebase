import type { AllowedEntity } from "./entities.ts";
import { cleanUntrustedText, looksLikeInstructions } from "./untrusted.ts";

export type Fetch = typeof fetch;

export interface EntityState {
  id: string;
  kind: AllowedEntity["kind"];
  name: string;
  state: string;
  lastChanged?: string;
  /** The device's name reads like instructions to an AI; tell the user. */
  suspicious?: true;
}

function config(env: Record<string, string | undefined> = process.env) {
  const url = env.HA_URL?.replace(/\/+$/, "");
  const token = env.HA_TOKEN;
  if (!url || !token) throw new Error("Home Assistant is not configured: set HA_URL and HA_TOKEN.");
  return { url, token };
}

async function haFetch(path: string, init: RequestInit, fetchImpl: Fetch): Promise<unknown> {
  const { url, token } = config();
  const response = await fetchImpl(`${url}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
  });
  if (response.status === 401) throw new Error("Home Assistant rejected HA_TOKEN (HTTP 401).");
  if (response.status === 404) throw new Error(`Home Assistant has no ${path}.`);
  if (!response.ok) throw new Error(`Home Assistant request ${path} failed with HTTP ${response.status}.`);
  return response.json();
}

/** Current state of each entity, reduced to the fields homebase reports. */
export async function getStates(entities: AllowedEntity[], fetchImpl: Fetch = fetch): Promise<EntityState[]> {
  return Promise.all(
    entities.map(async (entity) => {
      const raw = (await haFetch(`/api/states/${entity.id}`, { method: "GET" }, fetchImpl)) as {
        state?: unknown;
        last_changed?: unknown;
        attributes?: { friendly_name?: unknown };
      };
      const name = cleanUntrustedText(raw.attributes?.friendly_name, 80) || entity.id;
      return {
        id: entity.id,
        kind: entity.kind,
        name,
        state: cleanUntrustedText(raw.state, 40),
        ...(typeof raw.last_changed === "string" ? { lastChanged: raw.last_changed } : {}),
        ...(looksLikeInstructions(name) ? { suspicious: true as const } : {}),
      };
    }),
  );
}

/** Calls one Home Assistant service on one allowlisted entity. */
export async function callService(
  entity: AllowedEntity,
  service: string,
  data: Record<string, unknown> = {},
  fetchImpl: Fetch = fetch,
): Promise<{ id: string; service: string; ok: true }> {
  await haFetch(
    `/api/services/${entity.domain}/${service}`,
    { method: "POST", body: JSON.stringify({ entity_id: entity.id, ...data }) },
    fetchImpl,
  );
  return { id: entity.id, service: `${entity.domain}.${service}`, ok: true };
}
