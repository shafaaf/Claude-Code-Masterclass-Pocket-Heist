"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useUsers } from "@/lib/useUsers";
import {
  COLLECTIONS,
  heistConverter,
  type CreateHeistInput,
} from "@/types/firestore";
import HudFrame from "@/components/HudFrame";
import CodenamePrompt from "@/components/CodenamePrompt";
import styles from "./HeistForm.module.css";

const DEADLINE_MS = 48 * 60 * 60 * 1000;

function computeDeadline(): Date {
  return new Date(Date.now() + DEADLINE_MS);
}

interface FieldErrors {
  title?: string;
  description?: string;
  assignedTo?: string;
}

export default function HeistForm() {
  const router = useRouter();
  const { user } = useRequireAuth();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUserDoc = users.find((u) => u.id === user?.uid) ?? null;
  const assignableUsers = users.filter((u) => u.id !== user?.uid);

  function handleCancel() {
    router.push("/heists");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextFieldErrors: FieldErrors = {};
    if (!title.trim()) nextFieldErrors.title = "Title is required.";
    if (!description.trim())
      nextFieldErrors.description = "Description is required.";
    if (!assignedTo)
      nextFieldErrors.assignedTo = "Pick someone to assign this heist to.";

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    const assignee = assignableUsers.find((u) => u.id === assignedTo);
    if (!user || !currentUserDoc || !assignee) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const heistInput: CreateHeistInput = {
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdByCodename: currentUserDoc.codename,
        assignedTo: assignee.id,
        assignedToCodename: assignee.codename,
        deadline: computeDeadline(),
        createdAt: serverTimestamp(),
        finalStatus: null,
      };

      await addDoc(
        collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter),
        heistInput,
      );

      router.push("/heists");
    } catch {
      setSubmitError("Couldn't create the heist. Try again.");
      setSubmitting(false);
    }
  }

  if (usersLoading) {
    return <p className={styles.status}>Loading operatives…</p>;
  }

  if (usersError) {
    return (
      <p className={styles.status}>
        Couldn&apos;t load the roster. Try refreshing.
      </p>
    );
  }

  if (!user) {
    return null;
  }

  if (!currentUserDoc) {
    return <CodenamePrompt uid={user.uid} onSuccess={refetchUsers} />;
  }

  return (
    <HudFrame className={styles.frame}>
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <p className="hud-label">New Heist</p>
        <h2 className="form-title">Create a New Heist</h2>

        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Title
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.title && (
            <p className={styles.fieldError}>{fieldErrors.title}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.description && (
            <p className={styles.fieldError}>{fieldErrors.description}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="assignedTo" className={styles.label}>
            Assign to
          </label>
          <select
            id="assignedTo"
            className={styles.input}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            disabled={submitting}
          >
            <option value="" disabled>
              Select an operative
            </option>
            {assignableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.codename}
              </option>
            ))}
          </select>
          {fieldErrors.assignedTo && (
            <p className={styles.fieldError}>{fieldErrors.assignedTo}</p>
          )}
        </div>

        {submitError && <div className={styles.error}>{submitError}</div>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Heist"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </HudFrame>
  );
}
