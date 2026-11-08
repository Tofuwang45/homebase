import assert from "node:assert/strict";
import { test } from "node:test";

import { getAllowedEntities, requireEntity } from "../agent/lib/entities.ts";

const env = { HOMEBASE_ENTITIES: "light.kitchen, lock.front_door,cover.driveway_gate,binary_sensor.porch_motion,light.kitchen" };

test("parses, dedupes, and classifies entities by domain", () => {
  assert.deepEqual(
    getAllowedEntities(env).map((e) => [e.id, e.kind]),
    [
      ["light.kitchen", "light"],
      ["lock.front_door", "lock"],
      ["cover.driveway_gate", "gate"],
      ["binary_sensor.porch_motion", "sensor"],
    ],
  );
  assert.deepEqual(getAllowedEntities({}), []);
});

test("rejects malformed ids and unsupported domains", () => {
  assert.throws(() => getAllowedEntities({ HOMEBASE_ENTITIES: "Kitchen Light" }), /not an entity id/);
  assert.throws(() => getAllowedEntities({ HOMEBASE_ENTITIES: "alarm_control_panel.home" }), /does not support/);
});

test("requireEntity refuses unlisted entities and the wrong kind", () => {
  const allowed = getAllowedEntities(env);
  assert.equal(requireEntity("lock.front_door", "lock", allowed).domain, "lock");
  assert.throws(() => requireEntity("cover.garage", "gate", allowed), /not on the homebase allowlist.*cover\.driveway_gate/);
  assert.throws(() => requireEntity("light.kitchen", "lock", allowed), /is a light, not a lock/);
});
