import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import LandingScreen from "@/components/LandingScreen";
import ThrowbackLanding from "@/components/ThrowbackLanding";
import ProfileCaptureScreen from "@/components/ProfileCaptureScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import NoQuizScreen from "@/components/NoQuizScreen";
import { useQuizTheme } from "@/contexts/ThemeContext";
import { fetchQuizAttempt, fetchTodayQuiz, submitQuiz } from "@/lib/api";
import type { Question, SubmitResponse } from "@/lib/api";
import { hasUserProfile, setUserProfile } from "@/lib/user";

type Screen = "landing" | "throwback-landing" | "profile" | "quiz" | "results" | "no-quiz";

function getThemeForToday(): "default" | "throwback" {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  }).format(new Date());

  return weekday === "Thursday" ? "throwback" : "default";
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string>("");
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingAfterProfile, setPendingAfterProfile] = useState<"landing" | "throwback">("landing");
  const { setTheme } = useQuizTheme();

  useEffect(() => {
    const mode = getThemeForToday();
    setTheme(mode);
    if (mode === "throwback") {
      setScreen("throwback-landing");
    }
  }, [setTheme]);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTodayQuiz();
      if (!data.quizId || !data.questions.length) {
        setScreen("no-quiz");
      } else if (data.hasAttempted) {
        setQuizId(data.quizId);
        setQuestions(data.questions);
        const attempt = await fetchQuizAttempt(data.quizId);
        setResult(attempt);
        setScreen("results");
      } else {
        setQuizId(data.quizId);
        setQuestions(data.questions);
        setScreen("quiz");
      }
    } catch {
      setScreen("no-quiz");
    } finally {
      setLoading(false);
    }
  }, []);

  const startQuiz = useCallback(async (source: "landing" | "throwback" = "landing") => {
    if (!hasUserProfile()) {
      setPendingAfterProfile(source);
      setScreen("profile");
      return;
    }

    await loadQuiz();
  }, [loadQuiz]);

  const handleProfileSubmit = useCallback(async (profile: { name: string; school: string; schoolEmail: string }) => {
    setUserProfile(profile);
    if (pendingAfterProfile === "throwback") {
      setTheme("throwback");
    }
    await loadQuiz();
  }, [loadQuiz, pendingAfterProfile, setTheme]);

  const handleSubmit = useCallback(async (answers: Record<string, string>) => {
    setSubmitting(true);
    try {
      const data = await submitQuiz(quizId, answers);
      setResult(data);
      setScreen("results");
    } catch {
      setScreen("no-quiz");
    } finally {
      setSubmitting(false);
    }
  }, [quizId]);

  return (
    <div className="min-h-screen bg-cyber-gradient overflow-x-hidden">
      <AnimatedBackground />

      <div className="fixed top-5 right-5 z-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center neon-border group-hover:scale-110 transition-transform">
            <span className="text-lg font-bold text-background font-display">M</span>
          </div>
          <span className="text-xl font-bold neon-glow-cyan font-display group-hover:scale-105 transition-transform">
            MorganHacks
          </span>
          <span className="text-xs text-secondary ml-1 font-mono">2026</span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <LandingScreen key="landing" onStart={() => void startQuiz("landing")} loading={loading} />
        )}
        {screen === "throwback-landing" && (
          <ThrowbackLanding key="throwback-landing" onStart={() => void startQuiz("throwback")} loading={loading} />
        )}
        {screen === "profile" && (
          <ProfileCaptureScreen key="profile" loading={loading} onSubmit={handleProfileSubmit} />
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
