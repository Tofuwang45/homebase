import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack";

export default defineSchedule({
  // 06:00 UTC is 10:00 PM Pacific (11:00 PM during daylight time).
  cron: "0 6 * * *",
  async run({ to, waitUntil, appAuth }) {
    const channelId = process.env.HOMEBASE_SLACK_CHANNEL_ID;
    if (!channelId) return;
    waitUntil(
      to(slack, { channelId }).send(
        "Night check: call home_status. If any lock is unlocked or any gate is open, post which ones and ask whether to lock or close them. Don't change anything until a member replies. If everything is locked and closed, call no_reply.",
        { auth: appAuth },
      ),
    );
  },
});
