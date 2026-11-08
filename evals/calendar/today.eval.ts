import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

import { homeStubs, normalizeText } from "../fixtures.ts";

export default defineEval({
  description: "Lists today's events in order with correct local times.",
  tags: ["calendar"],
  async test(t) {
    const session = await t.session({ stubs: homeStubs() });
    const reply = normalizeText((await session.send("What do we have going on today?")).message);
    t.succeeded();
    t.calledTool("list_events");
    t.check(reply, includes(/soccer/i)).label("lists-soccer");
    t.check(reply, includes(/piano/i)).label("lists-piano");
    t.check(reply, includes(/\b10(?::00)?\b[^\n]*?(?:AM|a\.m\.)/i)).label("soccer-time");
    t.check(reply, includes(/\b3:30\b[^\n]*?(?:PM|p\.m\.)/i)).label("piano-time");
    const order = reply.search(/soccer/i) < reply.search(/piano/i);
    t.score({ score: order ? 1 : 0 }).label("in-order").gate(1);
  },
});
