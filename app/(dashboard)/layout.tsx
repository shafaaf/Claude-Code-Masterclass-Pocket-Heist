"use client";

// components
import Navbar from "@/components/Navbar";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, checking } = useRequireAuth();

  if (checking || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
