import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import QuizListPage from "./pages/QuizListPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/quizzes" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/quizzes" element={<ProtectedRoute><QuizListPage /></ProtectedRoute>} />
            <Route path="/quizzes/new" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
            <Route path="/quizzes/:id" element={<ProtectedRoute><QuizDetailPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
