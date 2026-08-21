import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <p>&copy; {new Date().getFullYear()} Pocket Heist. All rights reserved.</p>
    </footer>
  )
}
