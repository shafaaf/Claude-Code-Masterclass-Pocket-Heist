"use client";

import { useHeists } from "@/lib/useHeists";
import HeistCard from "@/components/HeistCard";
import styles from "./HeistList.module.css";

export default function HeistList() {
  const { heists, loading, error } = useHeists();

  if (loading) {
    return <p className={styles.status}>Loading heists…</p>;
  }

  if (error) {
    return (
      <p className={styles.status}>
        Couldn&apos;t load heists. Try refreshing.
      </p>
    );
  }

  if (heists.length === 0) {
    return <p className={styles.status}>No heists yet. Time to plan one.</p>;
  }

  return (
    <div className={styles.grid}>
      {heists.map((heist) => (
        <HeistCard key={heist.id} heist={heist} />
      ))}
    </div>
  );
}
