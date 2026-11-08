import { defineTool } from "eve/tools";
import { z } from "zod";

import { getAllowedEntities, requireEntity } from "#lib/entities.ts";
import { callService } from "#lib/ha.ts";

export default defineTool({
  description: "Turn allowlisted lights or switches on or off, optionally setting brightness.",
  inputSchema: z.object({
    entity_ids: z.array(z.string()).min(1).describe("Light or switch entity ids, such as light.kitchen."),
    on: z.boolean(),
    brightness_pct: z.number().int().min(1).max(100).optional(),
  }),
  async execute({ entity_ids, on, brightness_pct }) {
    const allowed = getAllowedEntities();
    // Validate every id before touching any device.
    const entities = entity_ids.map((id) => requireEntity(id, "light", allowed));
    const data = on && brightness_pct && entities.every((e) => e.domain === "light") ? { brightness_pct } : {};
    return {
      results: await Promise.all(entities.map((entity) => callService(entity, on ? "turn_on" : "turn_off", data))),
    };
  },
});
