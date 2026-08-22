"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./AuthForm.module.css";

export type AuthMode = "login" | "signup";

interface AuthFormProps {
  initialMode?: AuthMode;
}

const COPY: Record<
  AuthMode,
  {
    heading: string;
    submitLabel: string;
    switchPrompt: string;
    switchLabel: string;
    switchAriaLabel: string;
    switchTarget: AuthMode;
  }
> = {
  login: {
    heading: "Log in to your account",
    submitLabel: "Log in",
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchAriaLabel: "Switch to sign up mode",
    switchTarget: "signup",
  },
  signup: {
    heading: "Create an account",
    submitLabel: "Sign up",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchAriaLabel: "Switch to log in mode",
    switchTarget: "login",
  },
};

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const id = useId();
  const emailId = `${id}-email`;
  const passwordId = `${id}-password`;
  const copy = COPY[mode];

  function getErrorMessage(err: unknown): string {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      typeof err.code === "string"
    ) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return "Email is already registered.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/weak-password":
          return "Password must be at least 6 characters.";
        case "auth/user-not-found":
          return "No account found with this email.";
        case "auth/wrong-password":
          return "Incorrect password.";
        case "auth/too-many-requests":
          return "Too many failed attempts. Try again later.";
        default:
          return "Authentication failed. Please try again.";
      }
    }
    return "An unexpected error occurred.";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      console.log("[AuthForm] submit", {
        mode,
        email,
        password,
        timestamp: new Date().toISOString(),
      });
      router.push("/heists");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("[AuthForm] error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <h2 className="form-title">{copy.heading}</h2>

      <div className={styles.field}>
        <label htmlFor={emailId} className={styles.label}>
          Email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={passwordId} className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Loading..." : copy.submitLabel}
      </button>

      <p className={styles.switchPrompt}>
        {copy.switchPrompt}{" "}
        <button
          type="button"
          aria-label={copy.switchAriaLabel}
          className={styles.switchButton}
          onClick={() => setMode(copy.switchTarget)}
          disabled={loading}
        >
          {copy.switchLabel}
        </button>
      </p>
    </form>
  );
}
