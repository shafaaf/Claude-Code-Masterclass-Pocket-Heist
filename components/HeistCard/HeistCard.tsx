import type { Heist } from "@/types/firestore";
import HudFrame from "@/components/HudFrame";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  heist: Heist;
}

const STATUS_META = {
  active: { label: "Active", className: "statusActive" },
  success: { label: "Success", className: "statusSuccess" },
  failure: { label: "Failure", className: "statusFailure" },
} as const;

export default function HeistCard({ heist }: HeistCardProps) {
  const status = STATUS_META[heist.finalStatus ?? "active"];

  return (
    <HudFrame className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{heist.title}</h3>
        <span className={`${styles.status} ${styles[status.className]}`}>
          {status.label}
        </span>
      </div>
      <p className={styles.description}>{heist.description}</p>
      <div className={styles.assignee}>
        <span className="hud-label">Assigned to</span>
        <span className={styles.assigneeName}>{heist.assignedToCodename}</span>
      </div>
    </HudFrame>
  );
}
