// pages/index.jsx — Dashboard (homepage)
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const RECENT_ANALYSES = [
  { gene: "TCF7L2", disease: "Type 2 Diabetes",    time: "2 hours ago",  risk: 0.87 },
  { gene: "BRCA1",  disease: "Breast Cancer",       time: "1 day ago",    risk: 0.79 },
  { gene: "EGFR",   disease: "Lung Cancer",         time: "3 days ago",   risk: 0.74 },
  { gene: "APOE",   disease: "Alzheimer's Disease", time: "5 days ago",   risk: 0.62 },
];

const PIPELINE_STEPS = [
  { label: "Input",       sub: "Gene / DNA" },
  { label: "Mutation",    sub: "Detection" },
  { label: "Pathway",     sub: "Mapping" },
  { label: "Protein",     sub: "Generation" },
  { label: "Structure",   sub: "Prediction" },
  { label: "3D + AR",     sub: "Visualization" },
];

// Inline SVG icons
const Ic = ({ n, s = 20, c = "#4caf50" }) => {
  const st = { width: s, height: s };
  switch (n) {
    case "dna":    return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 10h14M5 14h14M5 18h14" strokeLinecap="round"/></svg>;
    case "search": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>;
    case "graph":  return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 12h3M14 12h3M12 7v3M12 14v3"/></svg>;
    case "atom":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/></svg>;
    case "cube":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case "ar":     return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "upload": return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "play":   return <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="5,3 19,12 5,21"/></svg>;
    case "bulb":   return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/></svg>;
    case "chevron":return <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
    default: return null;
  }
};

// DNA + protein blob hero illustration
function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" width="100%" height="190">
      {/* Helix strand 1 */}
      <path d="M30 170 C80 90, 140 110, 185 30 C230 -50, 285 70, 345 110" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
      {/* Helix strand 2 */}
      <path d="M55 160 C100 95, 155 100, 195 30 C240 -40, 295 80, 355 115" fill="none" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      {/* Rungs */}
      {[[80,148],[110,118],[140,95],[165,70],[195,55],[220,65],[250,85]].map(([x,y],i) => (
        <line key={i} x1={x-10} y1={y} x2={x+18} y2={y+12} stroke="#c8e6c9" strokeWidth="1.5" opacity="0.45"/>
      ))}
      {/* Protein blob */}
      <ellipse cx="305" cy="85" rx="65" ry="70" fill="#4caf50" opacity="0.06"/>
      {[
        [305,65,24],[325,85,19],[282,95,17],[308,112,15],[330,62,13],
        [280,72,15],[312,90,11],[295,52,11],[332,105,13],[268,88,11],
        [318,72,9],[290,108,10],
      ].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.1 + i * 0.025}/>
      ))}
      {/* Mutation site */}
      <circle cx="325" cy="82" r="9" fill="#e05c5c" opacity="0.9"/>
      <circle cx="325" cy="82" r="14" fill="#e05c5c" opacity="0.18"/>
      {/* Particles */}
      {[[355,40],[370,95],[285,30],[260,115]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill="#4caf50" opacity={0.3 + i*0.1}/>
      ))}
    </svg>
  );
}

const s = {
  // Hero
  hero: { background:"#fff", border:"1px solid #e8ede8", borderRadius:16, padding:"28px 32px", display:"grid", gridTemplateColumns:"1fr 400px", gap:20, alignItems:"center", position:"relative", overflow:"hidden" },
  heroWelcome: { fontSize:14, color:"#7a8c7a", margin:"0 0 4px" },
  heroTitle: { fontSize:38, fontWeight:800, color:"#1a2e1a", margin:"0 0 10px", letterSpacing:"-0.025em", lineHeight:1.05 },
  heroTitleGreen: { color:"#2d8c36" },
  heroSub: { fontSize:13, color:"#5a7a5a", lineHeight:1.65, margin:"0 0 22px", maxWidth:380 },
  heroActions: { display:"flex", gap:10, flexWrap:"wrap" },
  heroBtnPrimary: { display:"flex", alignItems:"center", gap:7, padding:"11px 20px", background:"#2d6a31", border:"none", borderRadius:9, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  heroBtnSecondary: { display:"flex", alignItems:"center", gap:7, padding:"11px 18px", background:"transparent", border:"1px solid #c8d8c8", borderRadius:9, color:"#3a6a3a", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  heroVisual: { position:"relative", height:190, overflow:"hidden" },
  aiPoweredBadge: { position:"absolute", bottom:10, right:0, background:"rgba(255,255,255,0.97)", border:"1px solid #e0ede0", borderRadius:8, padding:"5px 12px", fontSize:11, color:"#3a6a3a", fontWeight:600, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },

  // Pipeline section
  pipelineSection: { background:"#fff", border:"1px solid #e8ede8", borderRadius:16, padding:"22px 28px" },
  sectionTitle: { fontSize:15, fontWeight:700, color:"#1a2e1a", margin:"0 0 20px" },
  pipeline: { display:"flex", alignItems:"flex-start", gap:0, overflowX:"auto" },
  pipelineStep: { display:"flex", flexDirection:"column", alignItems:"center", gap:7, flex:1, minWidth:68 },
  pipelineIconBase: { width:48, height:48, borderRadius:"50%", background:"#f8faf8", border:"1.5px solid #e0e8e0", display:"flex", alignItems:"center", justifyContent:"center" },
  pipelineArrow: { color:"#c8d8c8", fontSize:18, padding:"0 2px", flexShrink:0, marginTop:14 },
  pipelineLabel: { fontSize:11, fontWeight:600, color:"#3a5a3a", textAlign:"center" },
  pipelineSub: { fontSize:10, color:"#9aaa9a", textAlign:"center", fontFamily:"'DM Mono',monospace" },

  // 3-col grid
  grid: { display:"grid", gridTemplateColumns:"300px 1fr 270px", gap:20, alignItems:"start" },

  // Mutation summary card
  mutCard: { background:"#fff", border:"1px solid #e8ede8", borderRadius:16, padding:20 },
  mutCardHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 },
  mutCardTitle: { fontSize:15, fontWeight:700, color:"#1a2e1a", margin:0 },
  highImpact: { padding:"4px 10px", background:"#f0faf0", border:"1px solid #4caf50", borderRadius:20, fontSize:11, color:"#2d7a31", fontWeight:600 },
  mutField: { marginBottom:14 },
  mutLabel: { fontSize:10, color:"#8aaa8a", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 },
  mutValue: { fontSize:15, fontWeight:600, color:"#1a2e1a" },
  mutValueMono: { fontSize:13, fontWeight:500, color:"#1a2e1a", fontFamily:"'DM Mono',monospace" },
  mutText: { fontSize:12, color:"#4a6a4a", lineHeight:1.55 },
  scoreBar: { height:6, background:"#e8ede8", borderRadius:3, overflow:"hidden", marginTop:6 },
  scoreBarFill: { height:"100%", background:"linear-gradient(90deg,#4caf50,#8bc34a)", borderRadius:3 },

  // Viewer panel (dark)
  viewerPanel: { background:"#111d13", border:"1px solid #2a4a2a", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column" },
  viewerHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", background:"#1a2e1a", borderBottom:"1px solid #2a4a2a" },
  viewerTitle: { fontSize:14, fontWeight:600, color:"#e8f0e8" },
  viewerBadge: { padding:"3px 10px", background:"rgba(74,163,84,0.18)", border:"1px solid rgba(74,163,84,0.35)", borderRadius:20, fontSize:11, color:"#6fcf7a", fontFamily:"'DM Mono',monospace" },
  viewerFrame: { height:400, background:"#080f09", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, padding:40 },
  viewerEmptyText: { fontSize:13, color:"rgba(232,240,232,0.28)", textAlign:"center", maxWidth:240, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif", margin:0 },

  // Right col
  rightCol: { display:"flex", flexDirection:"column", gap:16 },
  card: { background:"#fff", border:"1px solid #e8ede8", borderRadius:16, padding:18 },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 },
  cardTitle: { fontSize:14, fontWeight:700, color:"#1a2e1a", margin:0 },
  viewAll: { fontSize:12, color:"#4caf50", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  recentItem: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f5f7f5", cursor:"pointer" },
  recentGene: { fontSize:13, fontWeight:600, color:"#1a2e1a", marginBottom:2 },
  recentDisease: { fontSize:11, color:"#8aaa8a" },
  recentTime: { fontSize:11, color:"#b0c4b0", whiteSpace:"nowrap" },

  insightTitle: { display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:"#1a2e1a", margin:"0 0 10px" },
  insightText: { fontSize:12, color:"#5a7a5a", lineHeight:1.6, margin:"0 0 14px" },
  insightField: { marginBottom:10 },
  insightLabel: { fontSize:10, color:"#8aaa8a", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 },
  insightValue: { fontSize:13, fontWeight:600, color:"#1a2e1a", fontFamily:"'DM Mono',monospace" },
  insightGreen: { fontSize:15, color:"#2d7a31", fontWeight:700, fontFamily:"'DM Mono',monospace" },
  viewDetailsBtn: { display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"10px 14px", background:"#f5faf5", border:"1px solid #e0ede0", borderRadius:8, color:"#2d6a31", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  arCardTitle: { display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:"#1a2e1a", margin:"0 0 8px" },
  arCardText: { fontSize:12, color:"#5a7a5a", lineHeight:1.6, margin:"0 0 14px" },
  arBtn: { display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px 16px", background:"#2d6a31", border:"none", borderRadius:9, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" },
};

const PIPELINE_ICONS = ["dna","search","graph","atom","cube","ar"];

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Dashboard — MutaCure AR</title>
      </Head>
      <Layout>
        {/* ── Hero ── */}
        <div style={s.hero}>
          <div>
            <p style={s.heroWelcome}>Welcome to</p>
            <h1 style={s.heroTitle}>MutaCure <span style={s.heroTitleGreen}>AR</span></h1>
            <p style={s.heroSub}>Analyze genetic mutations, explore their biological impact, and visualize therapeutic possibilities in stunning 3D and AR.</p>
            <div style={s.heroActions}>
              <button style={s.heroBtnPrimary} onClick={() => router.push("/mutation")}>
                <Ic n="play" s={13} c="#fff" /> + New Analysis
              </button>
              <button style={s.heroBtnSecondary}>
                <Ic n="upload" s={13} c="#3a6a3a" /> Upload DNA File
              </button>
            </div>
          </div>
          <div style={s.heroVisual}>
            <HeroIllustration />
            <div style={s.aiPoweredBadge}>AI Powered Insights</div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div style={s.pipelineSection}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div style={s.pipeline}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} style={{ display:"flex", alignItems:"flex-start" }}>
                <div style={s.pipelineStep}>
                  <div style={s.pipelineIconBase}>
                    <Ic n={PIPELINE_ICONS[i]} s={20} c="#8aaa8a" />
                  </div>
                  <span style={s.pipelineLabel}>{step.label}</span>
                  <span style={s.pipelineSub}>{step.sub}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span style={s.pipelineArrow}>···</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom 3-col ── */}
        <div style={s.grid}>

          {/* Mutation Summary */}
          <div style={s.mutCard}>
            <div style={s.mutCardHeader}>
              <h3 style={s.mutCardTitle}>Mutation Summary</h3>
              <span style={s.highImpact}>High Impact</span>
            </div>
            <div style={s.mutField}>
              <div style={s.mutLabel}>Gene</div>
              <div style={s.mutValue}>TCF7L2</div>
            </div>
            <div style={s.mutField}>
              <div style={s.mutLabel}>Variant</div>
              <div style={s.mutValueMono}>rs7903146 (C&gt;T)</div>
            </div>
            <div style={s.mutField}>
              <div style={s.mutLabel}>Disease Association</div>
              <div style={s.mutValue} style2={{ fontSize:14 }}>Type 2 Diabetes</div>
            </div>
            <div style={s.mutField}>
              <div style={s.mutLabel}>Impact</div>
              <div style={s.mutText}>Affects insulin secretion and glucose metabolism regulation.</div>
            </div>
            <div>
              <div style={s.mutLabel}>Confidence Score</div>
              <div style={{ fontSize:20, fontWeight:700, color:"#1a2e1a", fontFamily:"'DM Mono',monospace", margin:"4px 0 6px" }}>0.87</div>
              <div style={s.scoreBar}><div style={{ ...s.scoreBarFill, width:"87%" }} /></div>
            </div>
            <button style={{ ...s.heroBtnPrimary, width:"100%", marginTop:16, justifyContent:"center" }} onClick={() => router.push("/mutation")}>
              <Ic n="play" s={13} c="#fff" /> Run Mutation Analysis
            </button>
          </div>

          {/* 3D Viewer placeholder */}
          <div style={s.viewerPanel}>
            <div style={s.viewerHeader}>
              <span style={s.viewerTitle}>3D Protein Structure</span>
              <span style={s.viewerBadge}>Interactive</span>
            </div>
            <div style={s.viewerFrame}>
              <Ic n="cube" s={44} c="rgba(232,240,232,0.18)" />
              <p style={s.viewerEmptyText}>Run a mutation analysis to generate and visualize the 3D protein structure</p>
              <button
                onClick={() => router.push("/protein")}
                style={{ padding:"9px 20px", background:"rgba(74,163,84,0.15)", border:"1px solid rgba(74,163,84,0.3)", borderRadius:8, color:"#6fcf7a", fontSize:12, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}
              >
                Open Protein Explorer →
              </button>
            </div>
          </div>

          {/* Right column */}
          <div style={s.rightCol}>
            {/* Recent Analyses */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Recent Analyses</h3>
                <button style={s.viewAll}>View All</button>
              </div>
              {RECENT_ANALYSES.map((r, i) => (
                <div key={i} style={{ ...s.recentItem, ...(i === RECENT_ANALYSES.length - 1 ? { borderBottom:"none" } : {}) }}
                  onClick={() => router.push(`/mutation?gene=${r.gene}`)}>
                  <div>
                    <div style={s.recentGene}>{r.gene}</div>
                    <div style={s.recentDisease}>{r.disease}</div>
                  </div>
                  <div style={s.recentTime}>{r.time}</div>
                </div>
              ))}
            </div>

            {/* Therapeutic Insight */}
            <div style={s.card}>
              <h3 style={s.insightTitle}>
                <Ic n="bulb" s={16} c="#4caf50" /> Therapeutic Insight
              </h3>
              <p style={s.insightText}>AI-generated protein candidate shows strong binding affinity to the target region. Potential therapy discovered.</p>
              <div style={s.insightField}>
                <div style={s.insightLabel}>Candidate Protein</div>
                <div style={s.insightValue}>MutaCure_001</div>
              </div>
              <div style={s.insightField}>
                <div style={s.insightLabel}>Predicted Affinity</div>
                <div style={s.insightGreen}>–9.3 kcal/mol</div>
              </div>
              <button style={s.viewDetailsBtn} onClick={() => router.push("/protein")}>
                View Details <Ic n="chevron" s={14} c="#2d6a31" />
              </button>
            </div>

            {/* AR Preview */}
            <div style={s.card}>
              <h3 style={s.arCardTitle}>
                <Ic n="ar" s={16} c="#4caf50" /> AR Preview
              </h3>
              <p style={s.arCardText}>Scan a marker to visualize this protein in your real world.</p>
              <a href="/ar/index.html" style={s.arBtn}>
                <Ic n="ar" s={14} c="#fff" /> Launch AR
              </a>
            </div>
          </div>

        </div>
      </Layout>
    </>
  );
}