export function formatMessageTime(date) {
  const str = new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // normalize AM/PM to uppercase without periods (e.g. "PM")
  return str.replace(
    /\s*([ap])\.?m\.?$/i,
    (_, p) => " " + (p.toUpperCase() === "A" ? "AM" : "PM"),
  );
}
