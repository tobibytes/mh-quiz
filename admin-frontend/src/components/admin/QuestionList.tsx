import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Question } from "@/lib/admin-api";
import QuestionForm, { QuestionFormData } from "./QuestionForm";
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

interface Props {
  questions: Question[];
  onAdd: (data: QuestionFormData) => Promise<void>;
  onUpdate: (id: string, data: QuestionFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function QuestionList({ questions, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Questions ({questions.length})</h2>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)}>Add Question</Button>
        )}
      </div>

      {showAdd && (
        <QuestionForm
          onSubmit={async (data) => {
            await onAdd(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {questions.map((q, i) =>
        editingId === q.id ? (
          <QuestionForm
            key={q.id}
            initial={q}
            onSubmit={async (data) => {
              await onUpdate(q.id, data);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={q.id} className="admin-surface flex items-start justify-between p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {i + 1}. {q.prompt}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="secondary">
                  {q.responseType === "multiple_choice" ? `MCQ · ${q.options.length} opts` : "Typed"}
                </Badge>
                {q.autoGrade && <Badge variant="outline">Auto-graded</Badge>}
              </div>
            </div>
            <div className="ml-2 flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditingId(q.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete question?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(q.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )
      )}

      {questions.length === 0 && !showAdd && (
        <p className="py-8 text-center text-sm text-muted-foreground">No questions yet. Add one to get started.</p>
      )}
    </div>
  );
}
