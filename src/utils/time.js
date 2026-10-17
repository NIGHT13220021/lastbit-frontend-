// src/utils/time.js
// Clock helpers for "closing time" deals. Times are strings like "10:30 PM".

export function toMinutes(str) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(str ?? "").trim());
  if (!m) return null;
  const h12 = Number(m[1]);
  const min = Number(m[2]);
  if (h12 < 1 || h12 > 12 || min > 59) return null;
  let h = h12 % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + min;
}

// "10:30pm" -> "10:30 PM"
export function normalizeClock(str) {
  const m = toMinutes(str);
  if (m === null) return String(str ?? "").trim();
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h24 % 12 || 12}:${mm} ${h24 >= 12 ? "PM" : "AM"}`;
}

// ordering key where 12:00-5:59 AM counts as "after midnight" (so 12:30 AM closes after 11 PM)
export function clockKey(str) {
  const m = toMinutes(str);
  if (m === null) return null;
  return m < 360 ? m + 1440 : m;
}

// the clock time `minutesFromNow` from now, rounded up to 5 minutes (used by demo data)
export function clockIn(minutesFromNow) {
  const ts = Math.ceil((Date.now() + minutesFromNow * 60000) / 300000) * 300000;
  const d = new Date(ts);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// minutes until pickupEnd (today). null if the time can't be read. <= 0 means the deal has ended.
export function minutesLeft(deal, now = new Date()) {
  let end = toMinutes(deal.pickupEnd);
  if (end === null) return null;
  const start = toMinutes(deal.pickupStart);
  let cur = now.getHours() * 60 + now.getMinutes();
  if (start !== null && end < start) {
    end += 1440; // closes after midnight
    if (cur < start) cur += 1440;
  }
  return end - cur;
}

export function formatLeft(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }
  return `${Math.max(1, min)} min`;
}