import { motion } from "framer-motion";

export default function NoQuizScreen() {
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
            Next MorganHacks quiz drops Monday 👀
          </p>
        </motion.div>
        <p className="mt-6 text-muted-foreground">
          Check back soon — something big is coming.
        </p>
      </motion.div>
    </motion.div>
  );
}
