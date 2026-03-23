import { useState } from "react";
import { motion } from "framer-motion";
import GlowButton from "./GlowButton";
import { Input } from "@/components/ui/input";

interface ProfileCaptureScreenProps {
  loading?: boolean;
  onSubmit: (profile: { name: string; school: string; schoolEmail: string }) => Promise<void> | void;
}

export default function ProfileCaptureScreen({ loading, onSubmit }: ProfileCaptureScreenProps) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [error, setError] = useState("");

  const canSubmit = name.trim().length > 1 && school.trim().length > 1 && /^[^\s@]+@[^\s@]+\.edu$/i.test(schoolEmail.trim()) && !loading;

  async function handleSubmit() {
    setError("");
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (school.trim().length < 2) {
      setError("Please enter your school.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.edu$/i.test(schoolEmail.trim())) {
      setError("Please use a valid school email ending in .edu.");
      return;
    }

    await onSubmit({ name: name.trim(), school: school.trim(), schoolEmail: schoolEmail.trim().toLowerCase() });
  }

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen px-6 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="glass-card rounded-3xl p-8 md:p-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <h1 className="font-display text-3xl text-foreground mb-3">Welcome 👋</h1>
        <p className="text-muted-foreground mb-6">
          First time here — add your name and school so we can track leaderboard scores for hackathon prizes.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-foreground/90">Full name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-foreground/90">School</label>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Morgan State University"
              autoComplete="organization"
              maxLength={120}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-foreground/90">School email (.edu)</label>
            <Input
              type="email"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="email"
              maxLength={160}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <GlowButton onClick={handleSubmit} disabled={!canSubmit} className="w-full py-4">
            {loading ? "Saving..." : "Continue to quiz"}
          </GlowButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
