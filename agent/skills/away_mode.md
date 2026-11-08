---
description: Use when a household member says they are leaving the house, going on a trip, or asks to secure the home.
---

1. Call `home_status` with no arguments.
2. Lock every lock that is `unlocked` with `lock_control` (locking needs no approval).
3. Close every gate that is `open` with `gate_control` (closing needs no approval).
4. Ask before turning lights off; some households leave one on. If the user already said "lights off", turn off every light that is `on` with `set_light`.
5. Reply with one short list: what you locked, closed, or turned off, and anything you could not change. Never unlock or open anything in away mode.
