import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, userConverter, type User } from "@/types/firestore";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDocs(collection(db, COLLECTIONS.USERS).withConverter(userConverter))
      .then((snapshot) => {
        if (cancelled) return;
        setUsers(snapshot.docs.map((doc) => doc.data()));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load users.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading, error };
}
