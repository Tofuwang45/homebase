# Security

## Reporting a vulnerability

Please don't open a public issue. Use GitHub's private vulnerability reporting for this repository.

## Design

homebase controls physical devices, so it's built to fail closed:

- **Device allowlist.** Tools act only on entities listed in `HOMEBASE_ENTITIES`. Each entity's domain decides what it is (light, lock, gate, sensor), and each tool accepts only its own kind. The model can never call an arbitrary Home Assistant service.
- **Approvals enforced by eve.** `lock_control` and `gate_control` use input-dependent approval policies: unlocking and opening always pause for a person, and locking and closing run immediately. This is enforced in code, not by asking the model to be careful. Unlocking is also disabled entirely unless `HOMEBASE_ALLOW_UNLOCK=true`. `create_event` asks once per conversation.
- **Household members only.** The Slack channel ignores messages and approval clicks from anyone not in `HOMEBASE_MEMBERS`, including other people in the same workspace.
- **Untrusted text.** Calendar titles and descriptions and device names can come from outside the household. They're cleaned, capped, and flagged `suspicious` when they read like instructions. The agent is told to report them and never act on them.
- **No cameras.** homebase reads motion sensors but never camera images.
- **Least privilege.** Use a dedicated, non-admin Home Assistant user for `HA_TOKEN`. Google Calendar access goes through Vercel Connect with an app-scoped grant.
- **No shell, no secrets in the repo.** `defaultTools: false`, so there are no bash, file, or web tools. Configuration is environment-only, and `.env.example` holds placeholders. Each session is capped at $0.25 of model cost. Eval tool stubs are granted only to local `eve dev` callers.
