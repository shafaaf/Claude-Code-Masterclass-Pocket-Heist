import { ClipboardList, Crosshair, Radar, Sparkles } from "lucide-react";
import HudFrame from "@/components/HudFrame";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className="hud-label">Mission Control</p>
          <h1 className={styles.heading}>
            Tiny missions.
            <br />
            Big office mischief.
          </h1>
          <p className={styles.tagline}>Plan. Execute. Outwit.</p>
          <p className={styles.description}>
            Turn your ordinary workday into an unforgettable caper. Create
            clever heists, assign pranks to coworkers, and watch the office
            chaos unfold. It&apos;s the game of workplace wit you&apos;ve always
            wanted.
          </p>
          <div className={styles.ctaGroup}>
            <a href="/signup" className={styles.ctaPrimary}>
              Get Started
            </a>
            <a href="#features" className={styles.ctaSecondary}>
              Learn More
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <HudFrame className={styles.gradientBox}>
            <Radar
              className={styles.gradientIcon}
              size={96}
              strokeWidth={1.25}
            />
          </HudFrame>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <HudFrame className={styles.feature}>
          <ClipboardList
            className={styles.featureIcon}
            size={32}
            strokeWidth={1.5}
          />
          <h3>Plan Your Heist</h3>
          <p>
            Create custom missions with titles, descriptions, and deadlines.
            Design the perfect prank with all the details you need.
          </p>
        </HudFrame>

        <HudFrame className={styles.feature}>
          <Crosshair
            className={styles.featureIcon}
            size={32}
            strokeWidth={1.5}
          />
          <h3>Assign & Ambush</h3>
          <p>
            Pick your target and assign heists to coworkers. Watch as they
            unknowingly accept their mission.
          </p>
        </HudFrame>

        <HudFrame className={styles.feature}>
          <Sparkles
            className={styles.featureIcon}
            size={32}
            strokeWidth={1.5}
          />
          <h3>Track Success</h3>
          <p>
            Mark heists as success or failure. Build your reputation as the
            office&apos;s master of mischief.
          </p>
        </HudFrame>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          © 2026 Pocket Heist. Tiny missions for big laughs.{" "}
          <a href="/login">Already have an account?</a>
        </p>
      </footer>
    </div>
  );
}
