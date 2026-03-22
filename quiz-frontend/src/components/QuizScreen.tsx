import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/api";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import GlowButton from "./GlowButton";

interface QuizScreenProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  submitting: boolean;
}

export default function QuizScreen({ questions, onSubmit, submitting }: QuizScreenProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const q = questions[current];
  const answer = answers[q.id] || "";
  const isLast = current === questions.length - 1;
  const canProceed = answer.trim().length > 0;

  function handleAnswer(val: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function handleNext() {
    if (isLast) {
      onSubmit(answers);
    } else {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 relative z-10">
      <div className="w-full max-w-2xl mb-10">
        <ProgressBar current={current + 1} total={questions.length} />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <QuestionCard
          key={q.id}
          question={q}
          answer={answer}
          onAnswer={handleAnswer}
          direction={direction}
        />
      </AnimatePresence>

      <div className="mt-10">
        <GlowButton
          onClick={handleNext}
          disabled={!canProceed || submitting}
          className="text-base px-10 py-4"
        >
          {submitting ? "Submitting..." : isLast ? "Submit" : "Next →"}
        </GlowButton>
      </div>
    </div>
  );
}
