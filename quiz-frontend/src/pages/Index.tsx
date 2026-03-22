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
      if (!data.quizId || !data.questions.length) {
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
        { id: "1", responseType: "multiple_choice", prompt: "When was the first MorganHacks held?", options: [{ id: "1a", label: "2019" }, { id: "1b", label: "2020" }, { id: "1c", label: "2021" }, { id: "1d", label: "2022" }], autoGrade: false },
        { id: "2", responseType: "multiple_choice", prompt: "Which university hosts MorganHacks?", options: [{ id: "2a", label: "Morgan State University" }, { id: "2b", label: "Howard University" }, { id: "2c", label: "Spelman College" }, { id: "2d", label: "Hampton University" }], autoGrade: false },
        { id: "3", responseType: "short_answer", prompt: "What is the theme of MorganHacks 2026?", options: [], autoGrade: false },
        { id: "4", responseType: "multiple_choice", prompt: "How long does a typical MorganHacks last?", options: [{ id: "4a", label: "12 hours" }, { id: "4b", label: "24 hours" }, { id: "4c", label: "36 hours" }, { id: "4d", label: "48 hours" }], autoGrade: false },
        { id: "5", responseType: "multiple_choice", prompt: "What track focuses on social impact projects?", options: [{ id: "5a", label: "Hack for Good" }, { id: "5b", label: "Build the Future" }, { id: "5c", label: "Code for Change" }, { id: "5d", label: "Impact Track" }], autoGrade: false },
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
        correctAnswer: q.options?.[0]?.label || "The Future",
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
