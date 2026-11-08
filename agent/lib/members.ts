/** Slack user ids allowed to use homebase, from `HOMEBASE_MEMBERS`. */
export function getMembers(env: Record<string, string | undefined> = process.env): Set<string> {
  return new Set(
    (env.HOMEBASE_MEMBERS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0),
  );
}

export function isMember(userId: string | undefined, members = getMembers()): boolean {
  return Boolean(userId && members.has(userId));
}
