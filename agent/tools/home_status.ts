import { defineTool } from "eve/tools";
import { z } from "zod";

import { getAllowedEntities } from "#lib/entities.ts";
import { getStates } from "#lib/ha.ts";

export default defineTool({
  description:
    "Read the current state of the household's allowlisted devices: lights, locks, gates, and motion sensors. Pass entity ids to narrow it, or omit them to read everything.",
  inputSchema: z.object({
    entity_ids: z.array(z.string()).optional().describe("Entity ids such as lock.front_door. Omit for all."),
  }),
  async execute({ entity_ids }) {
    const allowed = getAllowedEntities();
    const unknown = (entity_ids ?? []).filter((id) => !allowed.some((entity) => entity.id === id));
    const selected = entity_ids?.length ? allowed.filter((entity) => entity_ids.includes(entity.id)) : allowed;
    return { devices: await getStates(selected, fetch), ...(unknown.length ? { notAllowlisted: unknown } : {}) };
  },
});
