import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to create quiz";
}

export default function CreateQuizPage() {
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date) return setError("Date is required");
    if (!type) return setError("Quiz type is required");

    setLoading(true);
    try {
      const quiz = await adminApi.createQuiz({ date, type });
      navigate(`/quizzes/${quiz.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-4 text-xl font-semibold text-foreground">Create Quiz</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-md border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Quiz Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="know_morganhacks">Know MorganHacks</SelectItem>
              <SelectItem value="throwback">Throwback</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create Quiz"}
        </Button>
      </form>
    </AdminLayout>
  );
}
