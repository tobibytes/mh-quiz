import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import QuestionList from "@/components/admin/QuestionList";
import { adminApi, QuizDetail } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const load = () => {
    if (!id) return;
    setLoading(true);
    adminApi.getQuiz(id)
      .then(setQuiz)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <AdminLayout><p className="text-sm text-muted-foreground">Loading…</p></AdminLayout>;
  if (error || !quiz) return <AdminLayout><p className="text-sm text-destructive">{error || "Quiz not found"}</p></AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/quizzes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">{quiz.date}</h1>
        <Badge variant="secondary">
          {quiz.type === "know_morganhacks" ? "Know MorganHacks" : "Throwback"}
        </Badge>
      </div>

      <QuestionList
        questions={quiz.questions}
        onAdd={async (data) => {
          await adminApi.createQuestion({ ...data, quizId: quiz.id });
          toast({ title: "Question added" });
          load();
        }}
        onUpdate={async (qId, data) => {
          await adminApi.updateQuestion(qId, data);
          toast({ title: "Question updated" });
          load();
        }}
        onDelete={async (qId) => {
          await adminApi.deleteQuestion(qId);
          toast({ title: "Question deleted" });
          load();
        }}
      />
    </AdminLayout>
  );
}
