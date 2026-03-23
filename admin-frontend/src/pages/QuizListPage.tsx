import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi, type AdminMetrics, type AuditLogEntry, type Quiz } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([adminApi.getQuizzes(), adminApi.getMetrics(), adminApi.getAuditLogs(6)])
      .then(([quizData, metricsData, auditData]) => {
        setQuizzes(quizData);
        setMetrics(metricsData);
        setAuditLogs(auditData);
      })
      .catch((e: Error) => setError(e.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = typeFilter === "all" ? quizzes : quizzes.filter((q) => q.type === typeFilter);

  const deleteQuiz = async (quizId: string) => {
    const previous = quizzes;
    setDeletingQuizId(quizId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));

    try {
      await adminApi.deleteQuiz(quizId);
      toast({ title: "Quiz deleted" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete quiz";
      setQuizzes(previous);
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    } finally {
      setDeletingQuizId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="admin-page-title">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage quiz schedules, questions, and activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
          <Link to="/quizzes/new">
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Quiz</Button>
          </Link>
        </div>
      </div>

      {metrics && (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Total Quizzes</p>
            <p className="text-xl font-semibold text-foreground">{metrics.quizzesCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Total Questions</p>
            <p className="text-xl font-semibold text-foreground">{metrics.questionsCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-xl font-semibold text-foreground">{metrics.usersCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Attempts</p>
            <p className="text-xl font-semibold text-foreground">{metrics.attemptsCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Today ({metrics.todayDate})</p>
            <p className="text-xl font-semibold text-foreground">{metrics.todayAttemptsCount}</p>
          </div>
        </div>
      )}

      <div className="admin-surface mb-4 p-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="know_morganhacks">Know MorganHacks</SelectItem>
            <SelectItem value="throwback">Throwback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No quizzes found.</p>
      )}

      <div className="space-y-2">
        {filtered.map((q) => (
          <div key={q.id} className="admin-surface flex items-center gap-2 p-3 transition-shadow hover:shadow-md">
            <Link
              to={`/quizzes/${q.id}`}
              className="flex min-w-0 flex-1 items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{q.date}</span>
                <Badge variant="secondary">
                  {q.type === "know_morganhacks" ? "Know MH" : "Throwback"}
                </Badge>
                {q.status && <Badge variant="outline">{q.status}</Badge>}
              </div>
              <span className="text-sm text-muted-foreground">
                {q.questionCount ?? 0} questions
              </span>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingQuizId === q.id}
                  aria-label="Delete quiz"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the quiz and related questions/attempts. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void deleteQuiz(q.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {!loading && auditLogs.length > 0 && (
        <div className="admin-surface mt-8 p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Recent Admin Activity</h2>
          <div className="space-y-1.5 text-sm">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-md border border-border/60 bg-background/80 px-2.5 py-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">{log.action}</span>
                <span>{log.entityType}</span>
                {log.entityId ? <span className="font-mono text-xs">{log.entityId}</span> : null}
                <span className="ml-auto text-xs">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
