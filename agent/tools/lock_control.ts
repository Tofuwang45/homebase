import { defineTool } from "eve/tools";
import { z } from "zod";

import { getAllowedEntities, requireEntity } from "#lib/entities.ts";
import { callService } from "#lib/ha.ts";

export default defineTool({
  description:
    "Lock or unlock an allowlisted door lock. Locking runs immediately; unlocking always asks a household member to approve first.",
  inputSchema: z.object({
    entity_id: z.string().describe("Lock entity id, such as lock.front_door."),
    action: z.enum(["lock", "unlock"]),
  }),
  // Enforced by eve, not by the model: anything but a plain lock waits for a person.
  approval: {
    request: ({ toolInput }) => (toolInput?.action === "lock" ? "not-applicable" : "user-approval"),
    prompt: ({ input }) => `${input.action === "unlock" ? "Unlock" : "Lock"} ${input.entity_id}?`,
  },
  async execute({ entity_id, action }) {
    const entity = requireEntity(entity_id, "lock", getAllowedEntities());
    if (action === "unlock" && process.env.HOMEBASE_ALLOW_UNLOCK !== "true") {
      throw new Error("Unlocking is disabled. Set HOMEBASE_ALLOW_UNLOCK=true to allow approved unlocks.");
    }
    return callService(entity, action);
  },
});
