import { cleanUntrustedText, looksLikeInstructions } from "./untrusted.ts";

export type Fetch = typeof fetch;

const API = "https://www.googleapis.com/calendar/v3/calendars";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  /** Title or description reads like instructions to an AI; tell the user. */
  suspicious?: true;
}

export function calendarSettings(env: Record<string, string | undefined> = process.env) {
  return {
    calendarId: env.HOMEBASE_CALENDAR_ID || "primary",
    timeZone: env.HOMEBASE_TIMEZONE || "America/Los_Angeles",
  };
}

/** Today's date and weekday in the household time zone, so the model can resolve "Tuesday". */
export function today(now = new Date(), timeZone = calendarSettings().timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday!,
    time: `${parts.hour}:${parts.minute}`,
    timeZone,
  };
}

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function assertLocalDateTime(value: string, field: string): void {
  if (!LOCAL_DATETIME.test(value)) throw new Error(`${field} must be a local date and time like 2026-11-10T15:00.`);
}

export async function listEvents(
  token: string,
  range: { start: string; end: string },
  fetchImpl: Fetch = fetch,
): Promise<CalendarEvent[]> {
  const { calendarId, timeZone } = calendarSettings();
  const params = new URLSearchParams({
    timeMin: range.start,
    timeMax: range.end,
    timeZone,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });
  const response = await fetchImpl(`${API}/${encodeURIComponent(calendarId)}/events?${params}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Google Calendar list failed with HTTP ${response.status}.`);
  const body = (await response.json()) as {
    items?: {
      id: string;
      summary?: string;
      description?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }[];
  };
  return (body.items ?? []).map((item) => {
    const title = cleanUntrustedText(item.summary, 120) || "(no title)";
    const description = cleanUntrustedText(item.description, 400);
    return {
      id: item.id,
      title,
      start: item.start?.dateTime ?? item.start?.date ?? "",
      end: item.end?.dateTime ?? item.end?.date ?? "",
      allDay: !item.start?.dateTime,
      ...(description ? { description } : {}),
      ...(looksLikeInstructions(`${title} ${description}`) ? { suspicious: true as const } : {}),
    };
  });
}

export async function createEvent(
  token: string,
  event: { title: string; start: string; end: string; description?: string },
  fetchImpl: Fetch = fetch,
): Promise<{ id: string; title: string; start: string; end: string; link?: string }> {
  assertLocalDateTime(event.start, "start");
  assertLocalDateTime(event.end, "end");
  if (event.end <= event.start) throw new Error("end must be after start.");
  const { calendarId, timeZone } = calendarSettings();
  const response = await fetchImpl(`${API}/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      summary: event.title,
      description: event.description,
      start: { dateTime: `${event.start}:00`, timeZone },
      end: { dateTime: `${event.end}:00`, timeZone },
    }),
  });
  if (!response.ok) throw new Error(`Google Calendar create failed with HTTP ${response.status}.`);
  const body = (await response.json()) as { id: string; htmlLink?: string };
  return { id: body.id, title: event.title, start: event.start, end: event.end, link: body.htmlLink };
}
