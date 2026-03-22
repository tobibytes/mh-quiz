import { motion } from "framer-motion";
import GlowButton from "./GlowButton";

interface MCQOptionsProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

export default function MCQOptions({ options, selected, onSelect }: MCQOptionsProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((opt, i) => (
        <motion.div
          key={opt}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlowButton
            variant={selected === opt ? "selected" : "option"}
            onClick={() => onSelect(opt)}
            className="w-full text-left text-base"
          >
            <span className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg border border-current/20 flex items-center justify-center text-xs font-display opacity-60">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </span>
          </GlowButton>
        </motion.div>
      ))}
    </div>
  );
}
