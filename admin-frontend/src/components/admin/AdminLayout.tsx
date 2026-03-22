import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/quizzes" className="text-base font-semibold text-foreground">
            MorganHacks Admin
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
