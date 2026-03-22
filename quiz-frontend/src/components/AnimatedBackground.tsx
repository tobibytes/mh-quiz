import { motion } from "framer-motion";
import { useQuizTheme } from "@/contexts/ThemeContext";

const defaultOrbs = [
  { x: "20%", y: "15%", size: 400, color: "hsl(195 100% 50% / 0.06)", delay: 0 },
  { x: "75%", y: "70%", size: 350, color: "hsl(270 80% 60% / 0.05)", delay: 1.5 },
  { x: "50%", y: "50%", size: 500, color: "hsl(195 100% 50% / 0.04)", delay: 3 },
];

const throwbackOrbs = [
  { x: "25%", y: "20%", size: 420, color: "hsl(270 70% 65% / 0.07)", delay: 0 },
  { x: "70%", y: "65%", size: 360, color: "hsl(330 80% 55% / 0.05)", delay: 1.5 },
  { x: "45%", y: "45%", size: 480, color: "hsl(270 70% 65% / 0.04)", delay: 3 },
];

export default function AnimatedBackground() {
  const { theme } = useQuizTheme();
  const isThrowback = theme === "throwback";
  const orbs = isThrowback ? throwbackOrbs : defaultOrbs;
  const gridColor = isThrowback ? "hsl(270 70% 65%)" : "hsl(195 100% 50%)";

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${isThrowback ? "throwback-noise" : ""}`}>
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Scanline overlay for throwback */}
      {isThrowback && <div className="absolute inset-0 throwback-scanlines" />}
      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`${theme}-${i}`}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: isThrowback ? 8 : 6,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
