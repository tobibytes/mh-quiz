import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface OptionEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
  error?: string;
}

export default function OptionEditor({ options, onChange, error }: OptionEditorProps) {
  const update = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(options.filter((_, idx) => idx !== i));
  };

  const add = () => onChange([...options, ""]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Options</label>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={opt}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
          />
          {options.length > 2 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-3 w-3" /> Add option
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
