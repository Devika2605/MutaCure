// components/Layout.jsx
// Shared sidebar + topbar shell used by Dashboard, Mutation Analysis, and Protein Explorer

import { useRouter } from "next/router";
import styles from "./Layout.module.css";

const NAV_ITEMS = [
  { id: "/",         label: "Dashboard",         icon: "grid" },
  { id: "/mutation", label: "Mutation Analysis",  icon: "dna" },
  { id: "/protein",  label: "Protein Explorer",   icon: "atom" },
  { id: "/ar/index.html", label: "AR Viewer",     icon: "ar",  external: true },
  { id: "/insights", label: "Therapy Insights",   icon: "bulb" },
  { id: "/history",  label: "History",            icon: "clock" },
];

const BOTTOM_NAV = [
  { id: "/settings", label: "Settings", icon: "settings" },
  { id: "/help",     label: "Help",     icon: "help" },
];

function NavIcon({ name }) {
  const s = { width: 15, height: 15, flexShrink: 0 };
  switch (name) {
    case "grid": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "dna": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 10h14M5 14h14M5 18h14" strokeLinecap="round"/></svg>;
    case "atom": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/></svg>;
    case "ar": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "bulb": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/></svg>;
    case "clock": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "settings": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case "help": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>;
    default: return null;
  }
}

export default function Layout({ children, pageTitle = "MutaCure AR" }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const handleNav = (item) => {
    if (item.external) {
      window.open(item.id, "_blank");
    } else {
      router.push(item.id);
    }
  };

  return (
    <div className={styles.shell}>
      {/* ── Left sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6fcf7a" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
              <path d="M12 6v2M12 16v2M6 12h2M16 12h2"/>
            </svg>
          </div>
          <span className={styles.logoText}>Muta<span>Cure</span> AR</span>
        </div>

        <nav className={styles.navSection}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${currentPath === item.id ? styles.navItemActive : ""}`}
              onClick={() => handleNav(item)}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </button>
          ))}

          <div className={styles.navDivider} />

          {BOTTOM_NAV.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${currentPath === item.id ? styles.navItemActive : ""}`}
              onClick={() => router.push(item.id)}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarBottomCard}>
            <div className={styles.sidebarSlogan}>Decode. Design.<br />Experience Biology.</div>
            <div className={styles.sidebarSub}>AI-powered mutation therapy</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarTagline}>
            <div className={styles.topbarDot} />
            <span className={styles.topbarTaglineText}>
              From Genetic Mutation to Therapy — Visualized in Real Time
            </span>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.topbarIconBtn} title="Toggle theme">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
            <button className={styles.topbarIconBtn} title="Notifications">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
            <div className={styles.avatarBtn}>A</div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8aaa8a" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}