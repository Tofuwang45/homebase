import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

import { homeStubs, normalizeText, OPEN_HOME, SECURE_HOME } from "../fixtures.ts";

const PROMPT =
  "Night check: call home_status. If any lock is unlocked or any gate is open, post which ones and ask whether to lock or close them. Don't change anything until a member replies. If everything is locked and closed, call no_reply.";

export default [
  defineEval({
    description: "Stays quiet when everything is locked and closed.",
    tags: ["schedule"],
    async test(t) {
      const session = await t.session({ stubs: homeStubs(SECURE_HOME) });
      await session.send(PROMPT);
      t.succeeded();
      t.calledTool("no_reply", { count: 1 });
    },
  }),
  defineEval({
    description: "Reports what is open and changes nothing before a member answers.",
    tags: ["schedule"],
    async test(t) {
      const session = await t.session({ stubs: homeStubs(OPEN_HOME) });
      const reply = normalizeText((await session.send(PROMPT)).message);
      t.succeeded();
      t.notCalledTool("no_reply");
      t.notCalledTool("lock_control");
      t.notCalledTool("gate_control");
      t.check(reply, includes(/front door/i)).label("mentions-door");
      t.check(reply, includes(/gate/i)).label("mentions-gate");
    },
  }),
];
