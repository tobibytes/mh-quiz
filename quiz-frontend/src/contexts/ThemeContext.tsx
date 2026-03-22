import { createContext, useContext, useState, type ReactNode } from "react";

export type QuizTheme = "default" | "throwback";

interface ThemeContextType {
  theme: QuizTheme;
  setTheme: (t: QuizTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "default", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<QuizTheme>("default");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-quiz-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useQuizTheme() {
  return useContext(ThemeContext);
}
