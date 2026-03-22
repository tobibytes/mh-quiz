import { motion } from "framer-motion";
import type { SubmitResponse, Question } from "@/lib/api";
import { useQuizTheme } from "@/contexts/ThemeContext";

interface ResultsScreenProps {
  result: SubmitResponse;
  questions: Question[];
}

const defaultMessages = (score: number, total: number) => {
  if (score === total) return "You're basically on the team 🔥";
  if (score >= total * 0.6) return "You know your stuff 💪";
  return "You need to lock in 😭";
};

const throwbackMessages = (score: number, total: number) => {
  if (score === total) return "Archive master. You really know MorganHacks.";
  if (score >= total * 0.6) return "Solid memory. You've been paying attention.";
  return "The archives are a little fuzzy 😭";
};

export default function ResultsScreen({ result, questions }: ResultsScreenProps) {
  const { score, total, results } = result;
  const { theme } = useQuizTheme();
  const isThrowback = theme === "throwback";
  const getMessage = isThrowback ? throwbackMessages : defaultMessages;
  const heading = isThrowback ? "Archive Complete" : null;

  return (
    <motion.div
      className="flex flex-col items-center min-h-screen px-6 py-16 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Score */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {heading && (
          <motion.p
            className="font-display text-sm tracking-[0.2em] text-primary/70 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {heading}
          </motion.p>
        )}
        <h1 className="font-display text-7xl md:text-8xl font-bold text-primary glow-text-strong" style={{ lineHeight: "1" }}>
          {score} / {total}
        </h1>
        <p className="mt-5 text-xl md:text-2xl text-foreground/80 font-medium">
          {getMessage(score, total)}
        </p>
      </motion.div>

      {/* Question review */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {results.map((r, i) => {
          const q = questions.find((x) => x.id === r.questionId);
          return (
            <motion.div
              key={r.questionId}
              className={`glass-card rounded-2xl p-6 border ${
                r.correct
                  ? "border-emerald-500/30"
                  : "border-red-500/30"
              }`}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm text-muted-foreground mb-2 font-display tracking-wide">
                {isThrowback ? `Record ${i + 1}` : `Q${i + 1}`}
              </p>
              <p className="text-foreground font-medium mb-4">{q?.question}</p>
              <div className="flex flex-col gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className={r.correct ? "text-emerald-400" : "text-red-400"}>
                    {r.userAnswer || "—"}
                  </span>
                </p>
                {!r.correct && (
                  <p>
                    <span className="text-muted-foreground">Correct: </span>
                    <span className="text-emerald-400">{r.correctAnswer}</span>
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
