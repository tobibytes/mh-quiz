import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    if (err.message.includes("date and type") || err.message.toLowerCase().includes("duplicate")) {
      return "A quiz already exists for that date and type.";
    }
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
      <Link to="/quizzes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </Link>

      <div className="admin-surface max-w-2xl p-6">
        <h1 className="admin-page-title">Create Quiz</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Schedule a quiz by date and theme type.</p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Quiz"}
          </Button>
          <Link to="/quizzes">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
}
