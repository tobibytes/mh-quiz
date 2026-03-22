import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi, Quiz } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    adminApi.getQuizzes()
      .then(setQuizzes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = typeFilter === "all" ? quizzes : quizzes.filter((q) => q.type === typeFilter);

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Quizzes</h1>
        <Link to="/quizzes/new">
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Quiz</Button>
        </Link>
      </div>

      <div className="mb-4">
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
          <Link
            key={q.id}
            to={`/quizzes/${q.id}`}
            className="flex items-center justify-between rounded-md border border-border bg-card p-3 transition-shadow hover:shadow-sm"
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
        ))}
      </div>
    </AdminLayout>
  );
}
