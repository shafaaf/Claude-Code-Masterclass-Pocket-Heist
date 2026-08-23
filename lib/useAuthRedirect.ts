import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function useAuthRedirect() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setChecking(false);
      if (user) {
        router.push("/heists");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, checking };
}
