import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi, type AdminMetrics, type LeaderboardEntry, type Quiz } from "@/lib/admin-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatPercent(score: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((score / total) * 100)}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizId, setQuizId] = useState<string>("all");
  const [limit, setLimit] = useState<string>("100");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const safeLimit = useMemo(() => {
    const num = Number(limit);
    if (!Number.isFinite(num)) return 100;
    return Math.min(Math.max(Math.trunc(num), 1), 500);
  }, [limit]);

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([
      adminApi.getQuizzes(),
      adminApi.getMetrics(),
      adminApi.getLeaderboard({ quizId: quizId === "all" ? undefined : quizId, limit: safeLimit }),
    ])
      .then(([quizData, metricsData, leaderboardData]) => {
        setQuizzes(quizData);
        setMetrics(metricsData);
        setEntries(leaderboardData);
      })
      .catch((e: Error) => setError(e.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [quizId, safeLimit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track participants, scores, and winner candidates.</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">Refresh</Button>
      </div>

      {metrics && (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-xl font-semibold text-foreground">{metrics.usersCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Attempts</p>
            <p className="text-xl font-semibold text-foreground">{metrics.attemptsCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-xl font-semibold text-foreground">{metrics.todayAttemptsCount}</p>
          </div>
          <div className="admin-kpi">
            <p className="text-xs text-muted-foreground">Date Window</p>
            <p className="text-xl font-semibold text-foreground">{metrics.todayDate}</p>
          </div>
        </div>
      )}

      <div className="admin-surface mb-5 grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">Quiz filter</p>
          <Select value={quizId} onValueChange={setQuizId}>
            <SelectTrigger>
              <SelectValue placeholder="All quizzes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All quizzes</SelectItem>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.date} · {quiz.type === "know_morganhacks" ? "Know MH" : "Throwback"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-1 text-sm text-muted-foreground">Max rows</p>
          <Input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            onBlur={() => setLimit(String(safeLimit))}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={loadData} className="w-full">Apply</Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading leaderboard…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No attempts yet.</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="admin-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">School</th>
                <th className="px-3 py-2">School Email</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Attempts</th>
                <th className="px-3 py-2">Last Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.userId} className="border-b border-border/70 last:border-b-0">
                  <td className="px-3 py-2 font-medium text-foreground">{idx + 1}</td>
                  <td className="px-3 py-2 text-foreground">{entry.name || "Anonymous"}</td>
                  <td className="px-3 py-2 text-foreground">{entry.school || "—"}</td>
                  <td className="px-3 py-2 text-foreground">{entry.schoolEmail || "—"}</td>
                  <td className="px-3 py-2 text-foreground">
                    {entry.totalScore}/{entry.totalPossible} ({formatPercent(entry.totalScore, entry.totalPossible)})
                  </td>
                  <td className="px-3 py-2 text-foreground">{entry.attemptsCount}</td>
                  <td className="px-3 py-2 text-foreground">{formatDate(entry.lastSubmittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
