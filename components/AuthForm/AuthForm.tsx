"use client";

import { useId, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const id = useId();
  const emailId = `${id}-email`;
  const passwordId = `${id}-password`;
  const copy = COPY[mode];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("[AuthForm] submit", {
      mode,
      email,
      password,
      timestamp: new Date().toISOString(),
    });
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
          />
          <button
            type="button"
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitButton}>
        {copy.submitLabel}
      </button>

      <p className={styles.switchPrompt}>
        {copy.switchPrompt}{" "}
        <button
          type="button"
          aria-label={copy.switchAriaLabel}
          className={styles.switchButton}
          onClick={() => setMode(copy.switchTarget)}
        >
          {copy.switchLabel}
        </button>
      </p>
    </form>
  );
}
