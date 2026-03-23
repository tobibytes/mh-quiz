import { motion } from "framer-motion";

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function getNextQuizInfo() {
  const timeZone = "America/New_York";
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);

  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));

  const weekdayMap: Record<string, DayIndex> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const today = weekdayMap[map.weekday] ?? 0;
  const quizDays: DayIndex[] = [1, 4]; // Monday, Thursday

  let minOffset = 7;
  for (const day of quizDays) {
    const offset = (day - today + 7) % 7;
    if (offset !== 0 && offset < minOffset) {
      minOffset = offset;
    }
  }

  const y = Number(map.year);
  const m = Number(map.month);
  const d = Number(map.day);
  // Use a midday UTC timestamp to avoid timezone rollover issues (which could show the previous weekday).
  const nextDate = new Date(Date.UTC(y, m - 1, d + minOffset, 12, 0, 0));

  const dayNames: Record<DayIndex, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  const nextDayIndex = (((today + minOffset) % 7) as DayIndex);
  const dayLabel = dayNames[nextDayIndex];
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(nextDate);

  return { dayLabel, dateLabel };
}

export default function NoQuizScreen() {
  const { dayLabel, dateLabel } = getNextQuizInfo();

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen px-6 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="glass-card rounded-3xl p-10 md:p-14 text-center max-w-lg"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="font-display text-2xl md:text-3xl font-semibold text-foreground glow-text leading-relaxed">
            Next MorganHacks quiz drops {dayLabel} 👀
          </p>
        </motion.div>
        <p className="mt-6 text-muted-foreground">
          Check back on {dateLabel}.
        </p>
      </motion.div>
    </motion.div>
  );
}
