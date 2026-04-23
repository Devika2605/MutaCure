// pages/index.jsx — Public Landing Page (no auth required)
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Already logged in → skip landing, go straight to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "patient" ? "/patient" : "/dashboard");
    }
  }, [loading, user]);

  const features = [
    { icon: "🧬", title: "Mutation Detection",  desc: "Query ClinVar in real-time and detect disease-causing variants across thousands of genes." },
    { icon: "🔬", title: "Protein Structure",    desc: "Generate 3D protein structures using ESMFold with mutation sites highlighted." },
    { icon: "📱", title: "AR Visualization",     desc: "Visualize proteins in augmented reality — point your phone and see molecules in your space." },
    { icon: "💊", title: "Therapy Insights",     desc: "AI-generated therapeutic candidates with binding affinity predictions." },
    { icon: "👤", title: "Patient Portal",       desc: "Simplified results and personalised insights for patients and caregivers." },
    { icon: "📊", title: "Clinical Research",    desc: "Full research-grade analysis tools for clinicians and researchers." },
  ];

  const stats = [
    { value: "10,000+", label: "Genes Analysed"       },
    { value: "98.2%",   label: "Prediction Accuracy"  },
    { value: "3D + AR", label: "Visualization Modes"  },
    { value: "2 Roles", label: "Clinician & Patient"  },
  ];

  return (
    <>
      <Head>
        <title>MutaCure AR — From Mutation to Therapy</title>
        <meta name="description" content="Genomic mutation analysis with 3D protein visualization and augmented reality" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#0a1a0c", fontFamily: "'DM Sans', sans-serif", color: "#fff", overflowX: "hidden" }}>

        {/* ── Navbar ── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, background: "rgba(10,26,12,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(74,163,84,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2d7a31,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>MutaCure <span style={{ color: "#6fcf7a" }}>AR</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/login")}
              style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(74,163,84,0.4)", background: "transparent", color: "#6fcf7a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Sign In
            </button>
            <button onClick={() => router.push("/login")}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2d7a31,#4caf50)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Get Started →
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "120px 48px 80px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 800px 600px at 50% 40%, rgba(74,163,84,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* DNA decoration */}
          <svg style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", opacity: 0.1, pointerEvents: "none" }} width="280" height="480" viewBox="0 0 280 480">
            {[0,1,2,3,4,5,6,7,8,9].map(i => (
              <g key={i}>
                <ellipse cx="140" cy={48+i*44} rx="75" ry="16" fill="none" stroke="#4caf50" strokeWidth="2"/>
                <line x1="65" y1={48+i*44} x2="215" y2={48+i*44} stroke="#4caf50" strokeWidth="1" opacity="0.4"/>
              </g>
            ))}
          </svg>

          <div style={{ maxWidth: 760, textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(74,163,84,0.3)", background: "rgba(74,163,84,0.08)", marginBottom: 32, fontSize: 12, color: "#6fcf7a", fontFamily: "'DM Mono',monospace" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6fcf7a", display: "inline-block" }}/>
              AI-Powered Genomic Analysis Platform
            </div>

            <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 24px", background: "linear-gradient(135deg,#fff 0%,#a5d6a7 60%,#4caf50 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              From Mutation<br/>to Therapy
            </h1>

            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 48px", maxWidth: 540 }}>
              Detect disease-causing genetic variants, predict 3D protein structures, and visualize therapeutic candidates in augmented reality.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
              <button onClick={() => router.push("/login")}
                style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2d7a31,#4caf50)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(74,163,84,0.3)" }}>
                🔬 Clinician Sign In
              </button>
              <button onClick={() => router.push("/login")}
                style={{ padding: "14px 28px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                👤 Patient Portal
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(74,163,84,0.1)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(74,163,84,0.15)" }}>
              {stats.map((s, i) => (
                <div key={i} style={{ padding: "24px 16px", background: "rgba(10,26,12,0.8)", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(74,163,84,0.1)" : "none" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#6fcf7a", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: "80px 48px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(74,163,84,0.08)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 11, color: "#6fcf7a", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>Platform Features</div>
              <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Everything in one platform</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {features.map((f, i) => (
                <div key={i}
                  style={{ padding: "28px 24px", borderRadius: 16, border: "1px solid rgba(74,163,84,0.12)", background: "rgba(255,255,255,0.02)", transition: "all 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(74,163,84,0.4)"; e.currentTarget.style.background="rgba(74,163,84,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(74,163,84,0.12)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}>
                  <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "80px 48px", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px", background: "linear-gradient(135deg,#fff,#6fcf7a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ready to start?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", marginBottom: 36, lineHeight: 1.6 }}>
              Sign in as a clinician for full research tools, or as a patient to view your personalised results.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => router.push("/login")}
                style={{ padding: "13px 32px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#2d7a31,#4caf50)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(74,163,84,0.25)" }}>
                🔬 Clinician Sign In
              </button>
              <button onClick={() => router.push("/login")}
                style={{ padding: "13px 28px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                👤 Patient Sign In
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding: "24px 48px", borderTop: "1px solid rgba(74,163,84,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#2d7a31,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>MutaCure AR</span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono',monospace" }}>From Genetic Mutation to Therapy — Visualized in Real Time</span>
        </footer>

      </div>
    </>
  );
}