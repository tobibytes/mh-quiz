import { motion } from "framer-motion";
import GlowButton from "./GlowButton";

interface LandingScreenProps {
  onStart: () => void;
  loading?: boolean;
}

export default function LandingScreen({ onStart, loading }: LandingScreenProps) {
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

      {/* Start */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlowButton onClick={onStart} disabled={loading} className="text-lg px-10 py-5">
          {loading ? "Loading..." : "Enter Quiz"}
        </GlowButton>
      </motion.div>
    </motion.div>
  );
}
