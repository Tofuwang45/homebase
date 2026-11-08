import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack";

export default defineSchedule({
  // 15:00 UTC is 7:00 AM Pacific (8:00 AM during daylight time).
  cron: "0 15 * * *",
  async run({ to, waitUntil, appAuth }) {
    const channelId = process.env.HOMEBASE_SLACK_CHANNEL_ID;
    if (!channelId) {
      console.warn("homebase: set HOMEBASE_SLACK_CHANNEL_ID to enable the morning brief.");
      return;
    }
    waitUntil(
      to(slack, { channelId }).send(
        "Morning brief: call whats_today, list today's calendar events, and check home_status. Post today's events and anything left unlocked or open overnight. If there are no events and everything is locked and closed, call no_reply.",
        { auth: appAuth },
      ),
    );
  },
});
