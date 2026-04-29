"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition" | "whileInView" | "viewport"> {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  blur = false,
  once = true,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? "blur(12px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
