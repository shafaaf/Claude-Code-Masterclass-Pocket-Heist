import { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, userConverter, type User } from "@/types/firestore";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(() => {
    return getDocs(
      collection(db, COLLECTIONS.USERS).withConverter(userConverter),
    )
      .then((snapshot) => {
        if (!mountedRef.current) return;
        setUsers(snapshot.docs.map((doc) => doc.data()));
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setError("Failed to load users.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refetch();

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  return { users, loading, error, refetch };
}
