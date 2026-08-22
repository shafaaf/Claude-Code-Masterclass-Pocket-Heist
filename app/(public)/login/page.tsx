"use client";

import { useAuthRedirect } from "@/lib/useAuthRedirect";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  useAuthRedirect();

  return (
    <div className="center-content">
      <div className="page-content">
        <AuthForm initialMode="login" />
      </div>
    </div>
  );
}
