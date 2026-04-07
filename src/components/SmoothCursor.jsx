import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CrosshairCursor({ color = "#C9A84C", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="0" x2="10" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="14" x2="10" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="10" x2="6" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DotCursor({ color = "#C9A84C", size = 8 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
      }}
    />
  );
}

export function RingCursor({ color = "#C9A84C", size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderRadius: "50%",
      }}
    />
  );
}

export default function SmoothCursor({ springConfig }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig || { damping: 20, stiffness: 100 });
  const springY = useSpring(mouseY, springConfig || { damping: 20, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <CrosshairCursor />
    </motion.div>
  );
}
