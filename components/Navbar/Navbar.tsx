"use client";

import { Clock8, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
            <Link href="/heists/create">Create Heist</Link>
          </li>
          <li>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" size={16} />
              Log out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
