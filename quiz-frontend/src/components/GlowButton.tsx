import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useQuizTheme } from "@/contexts/ThemeContext";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "option" | "selected";
  className?: string;
}

const defaultVariants = {
  primary:
    "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_30px_hsl(195_100%_50%/0.4)]",
  option:
    "bg-muted/40 text-foreground border-border/40 hover:bg-muted/60 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(195_100%_50%/0.2)]",
  selected:
    "bg-primary/25 text-primary border-primary/70 shadow-[0_0_25px_hsl(195_100%_50%/0.35)]",
};

const throwbackVariants = {
  primary:
    "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_30px_hsl(270_70%_65%/0.4)]",
  option:
    "bg-muted/40 text-foreground border-border/40 hover:bg-muted/60 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(270_70%_65%/0.2)]",
  selected:
    "bg-primary/25 text-primary border-primary/70 shadow-[0_0_25px_hsl(270_70%_65%/0.35)]",
};

export default function GlowButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: GlowButtonProps) {
  const { theme } = useQuizTheme();
  const variants = theme === "throwback" ? throwbackVariants : defaultVariants;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        relative rounded-2xl border px-8 py-4 font-medium
        transition-all duration-300 ease-out
        disabled:opacity-30 disabled:cursor-not-allowed
        backdrop-blur-sm cursor-pointer
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
