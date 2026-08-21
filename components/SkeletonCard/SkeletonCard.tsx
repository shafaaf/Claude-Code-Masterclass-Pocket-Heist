import styles from "./SkeletonCard.module.css"

export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.headerLines}>
          <div className={`${styles.line} ${styles.lineWide}`} />
          <div className={`${styles.line} ${styles.lineNarrow}`} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.lineShort}`} />
      </div>
    </div>
  )
}
