import { defineEval } from "eve/evals";

import { homeStubs } from "../fixtures.ts";

export default defineEval({
  description: "Resolves 'Tuesday at 3pm' to the right local time and asks before adding.",
  tags: ["calendar"],
  async test(t) {
    const session = await t.session({ stubs: homeStubs() });
    await session.send("Add a dentist appointment on Tuesday at 3pm.");
    t.calledTool("whats_today");
    t.parked();
    t.calledTool("create_event", {
      status: "pending",
      input: { start: "2026-11-10T15:00", end: "2026-11-10T16:00" },
    });
  },
});
