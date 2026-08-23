"use client";

import { useState, type FormEvent } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/types/firestore";
import HudFrame from "@/components/HudFrame";
import styles from "./CodenamePrompt.module.css";

interface CodenamePromptProps {
  uid: string;
  onSuccess: () => void;
}

export default function CodenamePrompt({
  uid,
  onSuccess,
}: CodenamePromptProps) {
  const [codename, setCodename] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = codename.trim();
    if (!trimmed) {
      setError("Codename is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const existing = await getDocs(
        query(
          collection(db, COLLECTIONS.USERS),
          where("codename", "==", trimmed),
        ),
      );

      if (!existing.empty) {
        setError("That codename is already taken.");
        setSubmitting(false);
        return;
      }

      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        id: uid,
        codename: trimmed,
      });

      onSuccess();
    } catch {
      setError("Couldn't set your codename. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <HudFrame className={styles.frame}>
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <p className="hud-label">Identify Yourself</p>
        <h2 className="form-title">Choose Your Codename</h2>
        <p className={styles.description}>
          You need a codename before you can operate in the field.
        </p>

        <div className={styles.field}>
          <label htmlFor="codename" className={styles.label}>
            Codename
          </label>
          <input
            id="codename"
            type="text"
            className={styles.input}
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? "Setting..." : "Set Codename"}
        </button>
      </form>
    </HudFrame>
  );
}
