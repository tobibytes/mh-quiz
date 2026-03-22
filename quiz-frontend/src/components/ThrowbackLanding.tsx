import { motion } from "framer-motion";
import GlowButton from "./GlowButton";

interface ThrowbackLandingProps {
  onStart: () => void;
  loading?: boolean;
}

export default function ThrowbackLanding({ onStart, loading }: ThrowbackLandingProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Throwback glow backdrop */}
      <motion.div
        className="absolute w-[500px] h-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(270 70% 65% / 0.35), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Archive badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="inline-block font-display text-xs tracking-[0.25em] border border-primary/40 rounded-lg px-4 py-1.5 text-primary/80 mb-8"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ARCHIVE MODE
        </motion.span>
      </motion.div>

      <motion.h1
        className="font-display text-5xl md:text-7xl font-bold text-foreground glow-text-strong text-center leading-tight"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ lineHeight: "1.1" }}
      >
        Throwback
        <br />
        <span className="text-primary">Thursday</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-muted-foreground text-lg md:text-xl text-center max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        How much do you remember about MorganHacks?
      </motion.p>

      {/* Decrypting text */}
      <motion.p
        className="mt-3 text-xs font-mono text-muted-foreground/50 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
        transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Accessing archived records...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10"
      >
        <GlowButton onClick={onStart} disabled={loading} className="text-lg px-12 py-5">
          {loading ? "Decrypting..." : "Access Archives"}
        </GlowButton>
      </motion.div>
    </motion.div>
  );
}
