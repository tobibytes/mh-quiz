import { motion } from "framer-motion";
import { useQuizTheme } from "@/contexts/ThemeContext";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const { theme } = useQuizTheme();
  const pct = (current / total) * 100;
  const isThrowback = theme === "throwback";
  const label = isThrowback ? "ARCHIVE RECORD" : "QUESTION";
  const glowColor = isThrowback ? "hsl(270 70% 65% / 0.5)" : "hsl(195 100% 50% / 0.5)";

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-muted-foreground font-medium tracking-wide">
          {label}
        </span>
        <span className="font-display text-sm text-primary glow-text">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          style={{ boxShadow: `0 0 12px ${glowColor}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
