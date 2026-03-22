import { motion } from "framer-motion";
import type { Question } from "@/lib/api";
import MCQOptions from "./MCQOptions";
import ShortAnswerInput from "./ShortAnswerInput";

interface QuestionCardProps {
  question: Question;
  answer: string;
  onAnswer: (val: string) => void;
  direction: number;
}

export default function QuestionCard({ question, answer, onAnswer, direction }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: direction * 60, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: direction * -60, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-3xl p-8 md:p-10 w-full max-w-2xl mx-auto"
    >
      <h2 className="font-display text-xl md:text-2xl font-semibold mb-8 leading-snug text-foreground">
        {question.question}
      </h2>

      {question.type === "mcq" && question.options ? (
        <MCQOptions
          options={question.options}
          selected={answer || null}
          onSelect={onAnswer}
        />
      ) : (
        <ShortAnswerInput value={answer || ""} onChange={onAnswer} />
      )}
    </motion.div>
  );
}
