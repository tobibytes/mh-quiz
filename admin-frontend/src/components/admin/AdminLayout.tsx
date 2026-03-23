import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link, NavLink } from "react-router-dom";
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
    <div className="admin-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/quizzes" className="group inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/80 to-success text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                M
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-foreground">MorganHacks Admin</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Quiz Control Center</p>
              </div>
            </Link>

            <nav className="ml-2 flex items-center gap-2 text-sm">
              <NavLink
                to="/quizzes"
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                Quizzes
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                Leaderboard
              </NavLink>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
