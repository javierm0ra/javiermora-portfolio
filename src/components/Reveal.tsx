import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal${shown ? " is-in" : ""} ${className}`.trim()}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
