import { motion } from "framer-motion";
import GlowButton from "./GlowButton";
import { useQuizTheme } from "@/contexts/ThemeContext";

interface LandingScreenProps {
  onStart: (mode: "default" | "throwback") => void;
  loading?: boolean;
}

export default function LandingScreen({ onStart, loading }: LandingScreenProps) {
  const { setTheme } = useQuizTheme();

  function handleMode(mode: "default" | "throwback") {
    setTheme(mode);
    onStart(mode);
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title glow backdrop */}
      <motion.div
        className="absolute w-[500px] h-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.3), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.h1
        className="font-display text-5xl md:text-7xl font-bold text-foreground glow-text-strong text-center leading-tight"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ lineHeight: "1.1" }}
      >
        MorganHacks
        <br />
        <span className="text-primary">Quiz</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-muted-foreground text-lg md:text-xl text-center max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        How well do you know MorganHacks?
      </motion.p>

      {/* Mode selection */}
      <motion.div
        className="mt-12 flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlowButton onClick={() => handleMode("default")} disabled={loading} className="text-lg px-10 py-5">
          {loading ? "Loading..." : "Enter Quiz"}
        </GlowButton>

        <motion.button
          onClick={() => handleMode("throwback")}
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.97 }}
          className={`
            relative rounded-2xl border px-10 py-5 font-medium text-lg
            transition-all duration-300 ease-out cursor-pointer
            disabled:opacity-30 disabled:cursor-not-allowed
            backdrop-blur-sm
            bg-[hsl(270_70%_65%/0.15)] text-[hsl(270_70%_65%)] border-[hsl(270_70%_65%/0.4)]
            hover:bg-[hsl(270_70%_65%/0.25)] hover:shadow-[0_0_30px_hsl(270_70%_65%/0.35)]
          `}
        >
          <span className="flex items-center gap-3">
            <span className="text-xs font-display tracking-widest opacity-70 border border-current/30 rounded-md px-2 py-0.5">
              ARCHIVE
            </span>
            {loading ? "Loading..." : "Throwback Thursday"}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
