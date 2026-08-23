import { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, heistConverter, type Heist } from "@/types/firestore";

export function useHeists() {
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(() => {
    return getDocs(collection(db, COLLECTIONS.HEISTS))
      .then((snapshot) => {
        if (!mountedRef.current) return;
        const fetched = snapshot.docs.map((doc) =>
          heistConverter.fromFirestore(doc),
        );
        fetched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setHeists(fetched);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setError("Failed to load heists.");
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

  return { heists, loading, error, refetch };
}
