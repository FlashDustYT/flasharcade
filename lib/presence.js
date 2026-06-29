export function getLastSeenLabel(lastSeenAt) {
  if (!lastSeenAt) return "Offline";

  const last = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(last)) return "Offline";

  const diff = Date.now() - last;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < 2 * minute) return "Online";
  if (diff < hour) return `Last seen ${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `Last seen ${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `Last seen ${Math.floor(diff / day)}d ago`;

  return "Last seen a while ago";
}

export function isRecentlyOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  const last = new Date(lastSeenAt).getTime();
  return Number.isFinite(last) && Date.now() - last < 2 * 60 * 1000;
}
