import { connect } from "@vercel/connect/eve";

/**
 * Google Calendar credentials. With GOOGLE_CALENDAR_TOKEN set (local testing),
 * that static token is used; otherwise Vercel Connect brokers an app-scoped
 * OAuth grant for the shared family calendar.
 */
export const googleCalendarAuth = process.env.GOOGLE_CALENDAR_TOKEN
  ? { getToken: async () => ({ token: process.env.GOOGLE_CALENDAR_TOKEN! }) }
  : connect({ connector: process.env.HOMEBASE_GOOGLE_CONNECTOR || "google/homebase", principalType: "app" });
