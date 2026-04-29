export function getWeekStart(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

export function getWeekRange(now: Date = new Date()): {
  weekStart: Date;
  weekEnd: Date;
} {
  const weekStart = getWeekStart(now);
  return { weekStart, weekEnd: getWeekEnd(weekStart) };
}
