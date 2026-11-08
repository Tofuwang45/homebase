import { defineTool } from "eve/tools";
import { z } from "zod";

import { getAllowedEntities, requireEntity } from "#lib/entities.ts";
import { callService } from "#lib/ha.ts";

export default defineTool({
  description:
    "Open or close an allowlisted gate or garage door. Closing runs immediately; opening always asks a household member to approve first.",
  inputSchema: z.object({
    entity_id: z.string().describe("Cover entity id, such as cover.driveway_gate."),
    action: z.enum(["open", "close"]),
  }),
  approval: {
    request: ({ toolInput }) => (toolInput?.action === "close" ? "not-applicable" : "user-approval"),
    prompt: ({ input }) => `${input.action === "open" ? "Open" : "Close"} ${input.entity_id}?`,
  },
  async execute({ entity_id, action }) {
    const entity = requireEntity(entity_id, "gate", getAllowedEntities());
    return callService(entity, action === "open" ? "open_cover" : "close_cover");
  },
});
