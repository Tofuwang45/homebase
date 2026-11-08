import { defineTool } from "eve/tools";
import { z } from "zod";

import { listEvents } from "#lib/calendar.ts";
import { googleCalendarAuth } from "#lib/google.ts";

export default defineTool({
  description: "List events on the shared family calendar between two times, in start order.",
  inputSchema: z.object({
    start: z.string().describe("Range start as an ISO 8601 timestamp with offset, such as 2026-11-07T00:00:00-08:00."),
    end: z.string().describe("Range end as an ISO 8601 timestamp with offset."),
  }),
  async execute({ start, end }, ctx) {
    const { token } = await ctx.getToken(googleCalendarAuth);
    return { events: await listEvents(token, { start, end }) };
  },
});
