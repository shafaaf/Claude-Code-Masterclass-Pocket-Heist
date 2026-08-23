import type { HTMLAttributes } from "react";
import styles from "./HudFrame.module.css";

interface HudFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function HudFrame({
  children,
  className,
  ...rest
}: HudFrameProps) {
  return (
    <div className={`${styles.hudFrame} ${className ?? ""}`} {...rest}>
      <span className={styles.cornerTl} aria-hidden="true" />
      <span className={styles.cornerTr} aria-hidden="true" />
      <span className={styles.cornerBl} aria-hidden="true" />
      <span className={styles.cornerBr} aria-hidden="true" />
      {children}
    </div>
  );
}
