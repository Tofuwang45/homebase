const ENTITY_PATTERN = /^[a-z_]+\.[a-z0-9_]+$/;

/** What homebase may do with an entity, decided by its Home Assistant domain. */
export type EntityKind = "light" | "lock" | "gate" | "sensor";

const KIND_BY_DOMAIN: Record<string, EntityKind> = {
  light: "light",
  switch: "light",
  lock: "lock",
  cover: "gate",
  binary_sensor: "sensor",
  sensor: "sensor",
};

export interface AllowedEntity {
  id: string;
  domain: string;
  kind: EntityKind;
}

/**
 * The Home Assistant entities homebase may read or control, from
 * `HOMEBASE_ENTITIES` (comma-separated entity ids). Tools refuse anything
 * else, so the model can never reach an arbitrary device or service.
 */
export function getAllowedEntities(env: Record<string, string | undefined> = process.env): AllowedEntity[] {
  const ids = (env.HOMEBASE_ENTITIES ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const seen = new Map<string, AllowedEntity>();
  for (const id of ids) {
    if (!ENTITY_PATTERN.test(id)) throw new Error(`HOMEBASE_ENTITIES entry "${id}" is not an entity id like light.kitchen.`);
    const domain = id.slice(0, id.indexOf("."));
    const kind = KIND_BY_DOMAIN[domain];
    if (!kind) throw new Error(`HOMEBASE_ENTITIES entry "${id}": homebase does not support the ${domain} domain.`);
    seen.set(id, { id, domain, kind });
  }
  return [...seen.values()];
}

/** Returns the allowed entity, or throws a message the model can relay. */
export function requireEntity(id: string, kind: EntityKind, allowed: AllowedEntity[]): AllowedEntity {
  const entity = allowed.find((candidate) => candidate.id === id);
  if (!entity) {
    const names = allowed.filter((candidate) => candidate.kind === kind).map((candidate) => candidate.id);
    throw new Error(
      `${id} is not on the homebase allowlist. Allowed ${kind} entities: ${names.join(", ") || "(none)"}. Add it to HOMEBASE_ENTITIES to control it.`,
    );
  }
  if (entity.kind !== kind) throw new Error(`${id} is a ${entity.kind}, not a ${kind}.`);
  return entity;
}
