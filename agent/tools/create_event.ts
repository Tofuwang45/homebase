import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { createEvent } from "#lib/calendar.ts";
import { googleCalendarAuth } from "#lib/google.ts";

export default defineTool({
  description:
    "Add an event to the shared family calendar. Times are local to the household, like 2026-11-10T15:00. Asks for approval the first time in a conversation.",
  inputSchema: z.object({
    title: z.string().min(1).max(120),
    start: z.string().describe("Local start, YYYY-MM-DDTHH:mm."),
    end: z.string().describe("Local end, YYYY-MM-DDTHH:mm. Default to one hour after start if the user gave no end."),
    description: z.string().max(1000).optional(),
  }),
  approval: {
    request: once(),
    prompt: ({ input }) => `Add "${input.title}" on ${input.start.replace("T", " at ")}?`,
  },
  async execute(input, ctx) {
    const { token } = await ctx.getToken(googleCalendarAuth);
    return createEvent(token, input);
  },
});
