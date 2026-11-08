import { defaultSlackAuth, slackChannel } from "eve/channels/slack";

import { isMember } from "#lib/members.ts";

// Reads SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET from the environment. Only
// Slack users in HOMEBASE_MEMBERS can talk to homebase or answer its approval
// prompts; everyone else in the workspace is ignored.
export default slackChannel({
  onAppMention(ctx, message) {
    if (!isMember(message.author?.userId)) return null;
    return { auth: defaultSlackAuth(message, ctx) };
  },
  onDirectMessage(ctx, message) {
    if (!isMember(message.author?.userId)) return null;
    return { auth: defaultSlackAuth(message, ctx) };
  },
  async onMessage(ctx, message) {
    // Follow-ups in a thread homebase is already part of.
    if (!isMember(message.author?.userId) || !(await ctx.isSubscribed())) return null;
    return { auth: defaultSlackAuth(message, ctx) };
  },
  onInputResponse(ctx, submission) {
    if (!isMember(submission.user.id)) return null;
    return { auth: ctx.defaultAuth };
  },
});
