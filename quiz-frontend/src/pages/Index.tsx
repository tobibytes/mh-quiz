import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import LandingScreen from "@/components/LandingScreen";
import ThrowbackLanding from "@/components/ThrowbackLanding";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import NoQuizScreen from "@/components/NoQuizScreen";
import { useQuizTheme } from "@/contexts/ThemeContext";
import { fetchTodayQuiz, submitQuiz } from "@/lib/api";
import type { Question, SubmitResponse } from "@/lib/api";

type Screen = "landing" | "throwback-landing" | "quiz" | "results" | "no-quiz";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string>("");
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setTheme } = useQuizTheme();

  const handleModeSelect = useCallback((mode: "default" | "throwback") => {
    setTheme(mode);
    if (mode === "throwback") {
      setScreen("throwback-landing");
    } else {
      startQuiz();
    }
  }, []);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTodayQuiz();
      if (!data.quizId || !data.questions?.length) {
        setScreen("no-quiz");
      } else if (data.hasAttempted) {
        setScreen("no-quiz");
      } else {
        setQuizId(data.quizId);
        setQuestions(data.questions);
        setScreen("quiz");
      }
    } catch {
      const mock: Question[] = [
        { id: "1", type: "mcq", question: "When was the first MorganHacks held?", options: ["2019", "2020", "2021", "2022"] },
        { id: "2", type: "mcq", question: "Which university hosts MorganHacks?", options: ["Morgan State University", "Howard University", "Spelman College", "Hampton University"] },
        { id: "3", type: "short_answer", question: "What is the theme of MorganHacks 2026?" },
        { id: "4", type: "mcq", question: "How long does a typical MorganHacks last?", options: ["12 hours", "24 hours", "36 hours", "48 hours"] },
        { id: "5", type: "mcq", question: "What track focuses on social impact projects?", options: ["Hack for Good", "Build the Future", "Code for Change", "Impact Track"] },
      ];
      setQuizId("demo");
      setQuestions(mock);
      setScreen("quiz");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (answers: Record<string, string>) => {
    setSubmitting(true);
    try {
      const data = await submitQuiz(quizId, answers);
      setResult(data);
      setScreen("results");
    } catch {
      const demoResults = questions.map((q, i) => ({
        questionId: q.id,
        correct: i < 3,
        correctAnswer: q.options?.[0] || "The Future",
        userAnswer: answers[q.id] || "",
      }));
      setResult({ score: 3, total: questions.length, results: demoResults });
      setScreen("results");
    } finally {
      setSubmitting(false);
    }
  }, [quizId, questions]);

  return (
    <div className="min-h-screen bg-cyber-gradient overflow-x-hidden">
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <LandingScreen key="landing" onStart={handleModeSelect} loading={loading} />
        )}
        {screen === "throwback-landing" && (
          <ThrowbackLanding key="throwback-landing" onStart={startQuiz} loading={loading} />
        )}
        {screen === "quiz" && (
          <QuizScreen key="quiz" questions={questions} onSubmit={handleSubmit} submitting={submitting} />
        )}
        {screen === "results" && result && (
          <ResultsScreen key="results" result={result} questions={questions} />
        )}
        {screen === "no-quiz" && <NoQuizScreen key="no-quiz" />}
      </AnimatePresence>
    </div>
  );
}
