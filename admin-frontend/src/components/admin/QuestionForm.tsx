import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OptionEditor from "./OptionEditor";
import type { Question } from "@/lib/admin-api";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to save";
}

export interface QuestionFormData {
  prompt: string;
  responseType: "multiple_choice" | "typed";
  options: string[];
  correctAnswer: string | null;
  autoGrade: boolean;
}

interface Props {
  initial?: Question;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionForm({ initial, onSubmit, onCancel }: Props) {
    const toResponseType = (value: string): QuestionFormData["responseType"] => {
      return value === "multiple_choice" ? "multiple_choice" : "typed";
    };

  const [form, setForm] = useState<QuestionFormData>({
    prompt: initial?.prompt ?? "",
    responseType: initial?.responseType ?? "multiple_choice",
    options: initial?.options?.length ? initial.options : ["", ""],
    correctAnswer: initial?.correctAnswer ?? "",
    autoGrade: initial?.autoGrade ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Reset correct answer when switching response type
  useEffect(() => {
    if (form.responseType === "typed") {
      setForm((f) => ({ ...f, options: ["", ""] }));
    }
  }, [form.responseType]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.prompt.trim()) e.prompt = "Question text is required";

    if (form.responseType === "multiple_choice") {
      const filled = form.options.filter((o) => o.trim());
      if (filled.length < 2) e.options = "At least 2 non-empty options required";
    }

    if (form.autoGrade) {
      if (!form.correctAnswer?.trim()) {
        e.correctAnswer = "Correct answer is required when auto-grading";
      } else if (
        form.responseType === "multiple_choice" &&
        !form.options.includes(form.correctAnswer)
      ) {
        e.correctAnswer = "Correct answer must match one of the options";
      }
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        options: form.responseType === "multiple_choice" ? form.options.filter((o) => o.trim()) : [],
        correctAnswer: form.autoGrade ? (form.correctAnswer?.trim() || null) : null,
      });
    } catch (err: unknown) {
      setErrors({ submit: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-card p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Question text</label>
        <Textarea
          value={form.prompt}
          onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
          rows={3}
        />
        {errors.prompt && <p className="mt-1 text-sm text-destructive">{errors.prompt}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Response type</label>
        <Select
          value={form.responseType}
          onValueChange={(v) => setForm((f) => ({ ...f, responseType: toResponseType(v), correctAnswer: "" }))}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="typed">Typed Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.responseType === "multiple_choice" && (
        <OptionEditor
          options={form.options}
          onChange={(opts) => setForm((f) => ({ ...f, options: opts }))}
          error={errors.options}
        />
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="autoGrade"
          checked={form.autoGrade}
          onCheckedChange={(v) => setForm((f) => ({ ...f, autoGrade: !!v }))}
        />
        <label htmlFor="autoGrade" className="text-sm text-foreground">Grade immediately</label>
      </div>

      {form.autoGrade && (
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Correct answer</label>
          {form.responseType === "multiple_choice" ? (
            <Select
              value={form.correctAnswer ?? ""}
              onValueChange={(v) => setForm((f) => ({ ...f, correctAnswer: v }))}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {form.options.filter((o) => o.trim()).map((o, i) => (
                  <SelectItem key={i} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={form.correctAnswer ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
              placeholder="Expected answer"
            />
          )}
          {errors.correctAnswer && <p className="mt-1 text-sm text-destructive">{errors.correctAnswer}</p>}
        </div>
      )}

      {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : initial ? "Update Question" : "Add Question"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
