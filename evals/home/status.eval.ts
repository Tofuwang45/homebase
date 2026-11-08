import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

import { homeStubs, normalizeText } from "../fixtures.ts";

export default defineEval({
  description: "Answers a device question from home_status without inventing states.",
  tags: ["home"],
  async test(t) {
    const session = await t.session({ stubs: homeStubs() });
    const reply = normalizeText((await session.send("Is the front door locked?")).message);
    t.succeeded();
    t.calledTool("home_status");
    t.check(reply, includes(/\blocked\b/i)).label("says-locked");
    t.score({ score: /\bunlocked\b|not locked/i.test(reply) ? 0 : 1 }).label("no-wrong-state").gate(1);
  },
});
