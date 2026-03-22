import { motion } from "framer-motion";
import { useQuizTheme } from "@/contexts/ThemeContext";

interface ShortAnswerInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function ShortAnswerInput({ value, onChange }: ShortAnswerInputProps) {
  const { theme } = useQuizTheme();
  const focusGlow = theme === "throwback"
    ? "focus:border-primary/60 focus:shadow-[0_0_20px_hsl(270_70%_65%/0.2)]"
    : "focus:border-primary/60 focus:shadow-[0_0_20px_hsl(195_100%_50%/0.2)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
        className={`w-full rounded-2xl border border-border/40 bg-input/60 px-6 py-4
          text-foreground placeholder:text-muted-foreground/50
          backdrop-blur-sm transition-all duration-300
          focus:outline-none ${focusGlow}
          text-base`}
      />
    </motion.div>
  );
}
