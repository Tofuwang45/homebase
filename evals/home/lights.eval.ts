import { defineEval } from "eve/evals";

import { homeStubs } from "../fixtures.ts";

export default defineEval({
  description: "Turns off exactly the requested lights.",
  tags: ["home"],
  async test(t) {
    const session = await t.session({ stubs: homeStubs() });
    await session.send("Turn off the kitchen and living room lights.");
    t.succeeded();
    t.calledTool("set_light", {
      input: (value) => {
        const input = value as { entity_ids?: string[]; on?: boolean };
        return input.on === false && ["light.kitchen", "light.living_room"].every((id) => input.entity_ids?.includes(id));
      },
    });
    t.notCalledTool("lock_control");
    t.notCalledTool("gate_control");
  },
});
