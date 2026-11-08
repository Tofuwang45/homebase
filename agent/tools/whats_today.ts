import { defineTool } from "eve/tools";
import { z } from "zod";

import { today } from "#lib/calendar.ts";

export default defineTool({
  description:
    "Get today's date, weekday, and local time in the household time zone. Call this before turning words like 'Tuesday' or 'tomorrow' into dates.",
  inputSchema: z.object({}),
  async execute() {
    return today();
  },
});
