"use client";

import { useAuthRedirect } from "@/lib/useAuthRedirect";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  useAuthRedirect();

  return (
    <div className="center-content">
      <div className="page-content">
        <AuthForm initialMode="signup" />
      </div>
    </div>
  );
}
