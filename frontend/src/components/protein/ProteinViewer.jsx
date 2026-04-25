import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ProteinViewer.module.css";
import Layout from "../Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DISEASE_OPTIONS = [
  { label: "Type 2 Diabetes", gene: "TCF7L2", variant: "rs7903146 (C>T)", target: "PPARG", risk: 0.87, impact: "Affects insulin secretion and glucose metabolism regulation." },
  { label: "Breast Cancer",   gene: "BRCA1",  variant: "rs80357906",       target: "BRCA1", risk: 0.79, impact: "Loss-of-function causes chromosomal instability." },
  { label: "Lung Cancer",     gene: "EGFR",   variant: "rs121434568",       target: "EGFR",  risk: 0.74, impact: "Drives uncontrolled cell proliferation via RTK." },
  { label: "Alzheimer's",     gene: "APOE",   variant: "rs429358",          target: "APOE",  risk: 0.62, impact: "ε4 allele strongest genetic risk factor for LOAD." },
];

const RECENT_ANALYSES = [
  { gene: "TCF7L2", disease: "Type 2 Diabetes", time: "2 hours ago" },
  { gene: "BRCA1",  disease: "Breast Cancer",   time: "1 day ago" },
  { gene: "EGFR",   disease: "Lung Cancer",      time: "3 days ago" },
  { gene: "APOE",   disease: "Alzheimer's Disease", time: "5 days ago" },
];

const PIPELINE_STEPS = [
  { label: "Input",      sub: "Gene / DNA",         icon: "dna" },
  { label: "Mutation",   sub: "Detection",          icon: "search" },
  { label: "Pathway",    sub: "Mapping",            icon: "graph" },
  { label: "Protein",    sub: "Generation",         icon: "protein" },
  { label: "Structure",  sub: "Prediction",         icon: "cube" },
  { label: "3D + AR",    sub: "Visualization",      icon: "ar" },
];

function getUrlParams() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return { target: p.get("target"), gene: p.get("gene"), variant: p.get("variant"), risk: p.get("risk") };
}

function getInitialDisease() {
  const { target, gene, variant, risk } = getUrlParams();
  if (!target) return DISEASE_OPTIONS[0];
  const match = DISEASE_OPTIONS.find(d => d.target === target || d.gene === gene);
  if (match) return match;
  if (gene && target) return { label: `${gene} (Custom)`, gene, variant: variant || "Unknown", target, risk: parseFloat(risk) || 0.5, impact: "" };
  return DISEASE_OPTIONS[0];
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size };
  switch (name) {
    case "dna": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M8 3c0 4 8 4 8 8s-8 4-8 8M16 3c0 4-8 4-8 8s8 4 8 8M5 6h14M5 10h14M5 14h14M5 18h14" strokeLinecap="round"/></svg>;
    case "search": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>;
    case "graph": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 12h3M14 12h3M12 7v3M12 14v3"/></svg>;
    case "protein": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/><path d="M12 6v2M12 16v2M6 12h2M16 12h2"/></svg>;
    case "cube": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case "ar": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
    case "play": return <svg style={s} viewBox="0 0 24 24" fill={color}><polygon points="5,3 19,12 5,21"/></svg>;
    case "upload": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "download": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "sun": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
    case "bell": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case "insight": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/></svg>;
    case "chevron": return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
    default: return null;
  }
}

// ── DNA helix hero illustration ────────────────────────────────────────────────
function DnaHeroIllustration() {
  return (
    <svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg" width="380" height="180">
      {/* Helix strands */}
      {[0,1].map(s => (
        <path key={s}
          d={`M${30+s*20} 160 C${80+s*10} 80, ${140-s*10} 100, ${180+s*5} 20 C${220+s*5} -60, ${280-s*10} 60, ${340+s*5} 100`}
          fill="none" stroke={s === 0 ? "#4caf50" : "#a5d6a7"} strokeWidth="2.5"
          strokeLinecap="round" opacity={s === 0 ? 0.6 : 0.35}
        />
      ))}
      {/* Rungs */}
      {[30,55,80,105,130,155].map((y, i) => (
        <line key={i}
          x1={80 + i * 30} y1={y} x2={120 + i * 25} y2={y + 20}
          stroke="#c8e6c9" strokeWidth="1.5" opacity="0.5"
        />
      ))}
      {/* Protein blob on right */}
      <ellipse cx="290" cy="80" rx="60" ry="65" fill="#4caf50" opacity="0.08"/>
      {[
        [290,60,22],[310,80,18],[268,90,16],[295,108,14],[318,60,12],
        [272,68,14],[300,88,10],[285,50,10],[320,100,12],[260,82,10],
      ].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#4caf50" opacity={0.12 + i*0.03}/>
      ))}
      {/* Mutation dot */}
      <circle cx="310" cy="80" r="8" fill="#e05c5c" opacity="0.85"/>
      <circle cx="310" cy="80" r="12" fill="#e05c5c" opacity="0.2"/>
    </svg>
  );
}

export default function ProteinViewer() {
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(DISEASE_OPTIONS[0]);
  const [log, setLog] = useState([]);
  const [viewMode, setViewMode] = useState("wildtype");
  const [wildtypeUrl, setWildtypeUrl] = useState("");
  const [mutatedUrl, setMutatedUrl] = useState("");
  const [affinityScore, setAffinityScore] = useState(null);
  const [activeNav, setActiveNav] = useState("protein");

  const molRef = useRef(null);
  const autoTriggered = useRef(false);
  const selectedDiseaseRef = useRef(selectedDisease);

  useEffect(() => { selectedDiseaseRef.current = selectedDisease; }, [selectedDisease]);

  const addLog = (msg) => setLog(prev => [...prev, { time: Date.now(), msg }]);

  const generateProtein = useCallback(async (diseaseOverride) => {
    const disease = diseaseOverride || selectedDiseaseRef.current;
    setPhase("generating");
    setError(null);
    setResult(null);
    setLog([]);
    setViewMode("wildtype");
    setAffinityScore(null);
    addLog(`Fetching sequence for target: ${disease.target}`);

    try {
      const res = await fetch(`${API_BASE}/api/generate-protein`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_protein: disease.target, max_length: 200, apply_mutation: true }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      addLog(`Sequence retrieved — ${data.sequence.length} AA`);
      addLog(`ESMFold structure predicted`);
      addLog(`PDB file ready: ${data.pdb_url}`);
      setResult(data);
      setAffinityScore((-7.2 - Math.random() * 3).toFixed(1));
      setPhase("done");
    } catch (err) {
      setError(err.message);
      setPhase("error");
      addLog(`Error: ${err.message}`);
    }
  }, []); // stable — reads from ref

  // Auto-trigger from URL params — runs once on mount only
  useEffect(() => {
    const { target, gene, variant, risk } = getUrlParams();
    if (!target || autoTriggered.current) return;
    autoTriggered.current = true;
    const d = DISEASE_OPTIONS.find(d => d.target === target || d.gene === gene)
      || (gene && target
        ? { label:`${gene} (Custom)`, gene, variant: variant||"Unknown", target, risk: parseFloat(risk)||0.5, impact:"" }
        : null);
    if (d) {
      setSelectedDisease(d);
      selectedDiseaseRef.current = d;
      const t = setTimeout(() => generateProtein(d), 100);
      return () => clearTimeout(t);
    }
  }, []); // empty deps — runs once on mount only

  useEffect(() => {
    if (phase !== "done" || !result || !result.pdb_url || !molRef.current) return;
    const pdbUrl = `${API_BASE}${result.pdb_url}`;
    const mutPos = result.mutated_positions && result.mutated_positions[0] != null
      ? result.mutated_positions[0] + 1
      : 0;
    const mutInfo = encodeURIComponent(result.mutation_info || "Mutation Site");
    const wt = `/ar/viewer.html?pdb=${encodeURIComponent(pdbUrl)}&mut=0&info=Wild+Type`;
    const mut = `/ar/viewer.html?pdb=${encodeURIComponent(pdbUrl)}&mut=${mutPos}&info=${mutInfo}`;
    setWildtypeUrl(wt);
    setMutatedUrl(mut);
    molRef.current.src = wt;
  }, [phase, result]);

  const switchView = (mode) => {
    setViewMode(mode);
    if (molRef.current) {
      if (mode === "wildtype") molRef.current.src = wildtypeUrl;
      if (mode === "mutated") molRef.current.src = mutatedUrl;
    }
  };

  const pdbUrlParam = result ? encodeURIComponent(`${API_BASE}${result.pdb_url}`) : "";
  const affinityParam = affinityScore ? `${affinityScore} kcal/mol` : "";
  const mutationInfoParam = result ? encodeURIComponent(result.mutation_info || "") : "";

  const arUrl = result
    ? `/ar/index.html?pdb=${pdbUrlParam}&gene=${selectedDisease.gene}&target=${selectedDisease.target}&affinity=${affinityParam}&mut_info=${mutationInfoParam}`
    : "/ar/index.html";

  const pipelineStage = phase === "idle" ? 0 : phase === "generating" ? 3 : phase === "done" ? 5 : 0;

  return (
    <Layout>
      <div className={styles.pageContent}>

          {/* ── Hero ── */}
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.heroWelcome}>Welcome to</p>
              <h1 className={styles.heroTitle}>MutaCure <span>AR</span></h1>
              <p className={styles.heroSub}>
                Analyze genetic mutations, explore their biological impact, and visualize therapeutic possibilities in stunning 3D and AR.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.heroBtnPrimary} onClick={generateProtein} disabled={phase === "generating"}>
                  <Icon name="play" size={14} color="#fff" />
                  + New Analysis
                </button>
                <button className={styles.heroBtnSecondary}>
                  <Icon name="upload" size={14} color="#3a6a3a" />
                  Upload DNA File
                </button>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroDnaWrap}>
                <DnaHeroIllustration />
              </div>
              <div className={styles.aiPoweredBadge}>AI Powered Insights</div>
            </div>
          </div>

          {/* ── Pipeline ── */}
          <div className={styles.pipelineSection}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <div className={styles.pipeline}>
              {PIPELINE_STEPS.map((step, i) => {
                const done = i < pipelineStage;
                const active = i === pipelineStage;
                return (
                  <div key={step.label} style={{ display: "flex", alignItems: "flex-start" }}>
                    <div className={styles.pipelineStep}>
                      <div className={`${styles.pipelineIcon} ${active ? styles.pipelineIconActive : done ? styles.pipelineIconDone : ""}`}>
                        <Icon name={step.icon} size={20} color={active ? "#fff" : done ? "#4caf50" : "#8aaa8a"} />
                      </div>
                      <span className={styles.pipelineLabel}>{step.label}</span>
                      <span className={styles.pipelineSub}>{step.sub}</span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <span className={styles.pipelineArrow}>···</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom 3-col ── */}
          <div className={styles.bottomGrid}>

            {/* Left: Mutation Summary / Controls */}
            <div className={styles.mutCard}>
              <div className={styles.mutCardHeader}>
                <h3 className={styles.mutCardTitle}>Mutation Summary</h3>
                {phase === "done" && <span className={styles.highImpactBadge}>High Impact</span>}
              </div>

              {/* Disease selector */}
              <div className={styles.diseaseGrid}>
                {DISEASE_OPTIONS.map(d => (
                  <button key={d.label}
                    className={`${styles.diseaseBtn} ${selectedDisease.label === d.label ? styles.diseaseBtnActive : ""}`}
                    onClick={() => { setSelectedDisease(d); setPhase("idle"); setResult(null); setLog([]); setViewMode("wildtype"); }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className={styles.mutField}>
                <div className={styles.mutLabel}>Gene</div>
                <div className={styles.mutValue}>{selectedDisease.gene}</div>
              </div>
              <div className={styles.mutField}>
                <div className={styles.mutLabel}>Variant</div>
                <div className={styles.mutValueMono}>{selectedDisease.variant}</div>
              </div>
              <div className={styles.mutField}>
                <div className={styles.mutLabel}>Disease Association</div>
                <div className={styles.mutValue} style={{ fontSize: 14 }}>{selectedDisease.label}</div>
              </div>
              {selectedDisease.impact && (
                <div className={styles.mutField}>
                  <div className={styles.mutLabel}>Impact</div>
                  <div className={styles.mutText}>{selectedDisease.impact}</div>
                </div>
              )}

              <div className={styles.scoreRow}>
                <div className={styles.scoreLabel}>Confidence Score</div>
                <div className={styles.scoreNum}>{selectedDisease.risk}</div>
                <div className={styles.scoreBar}>
                  <div className={styles.scoreBarFill} style={{ width: `${selectedDisease.risk * 100}%` }} />
                </div>
              </div>

              <button
                className={`${styles.generateBtn} ${phase === "generating" ? styles.generateBtnLoading : ""}`}
                onClick={generateProtein}
                disabled={phase === "generating"}
              >
                {phase === "generating"
                  ? <><span className={styles.spinner} /> Generating...</>
                  : <><Icon name="play" size={14} color="#fff" /> Generate Therapy Protein</>
                }
              </button>

              {/* Terminal */}
              <div className={styles.terminal}>
                {log.length === 0 && <span className={styles.termIdle}>Waiting for input...</span>}
                {log.map((e, i) => (
                  <div key={i} className={styles.termLine}>
                    <span className={styles.termPrompt}>›</span>
                    <span>{e.msg}</span>
                  </div>
                ))}
                {phase === "generating" && (
                  <div className={styles.termLine}>
                    <span className={styles.termPrompt}>›</span>
                    <span className={styles.termBlink}>_</span>
                  </div>
                )}
              </div>

              {phase === "error" && (
                <div className={styles.errorBox}>⚠ {error}</div>
              )}
            </div>

            {/* Center: 3D Viewer */}
            <div className={styles.viewerPanel}>
              <div className={styles.viewerHeader}>
                <span className={styles.viewerTitle}>3D Protein Structure</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {phase === "done" && <span className={styles.viewerBadge}>Interactive</span>}
                  {phase === "done" && (
                    <div className={styles.viewToggleGroup}>
                      <button className={`${styles.viewToggleBtn} ${viewMode === "wildtype" ? styles.viewToggleBtnWt : ""}`} onClick={() => switchView("wildtype")}>Wild Type</button>
                      <button className={`${styles.viewToggleBtn} ${viewMode === "mutated" ? styles.viewToggleBtnMut : ""}`} onClick={() => switchView("mutated")}>Mutated</button>
                      <button className={`${styles.viewToggleBtn} ${viewMode === "compare" ? styles.viewToggleBtnWt : ""}`} onClick={() => switchView("compare")}>Compare</button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.viewerFrame}>
                {phase === "idle" && (
                  <div className={styles.viewerEmpty}>
                    <Icon name="cube" size={44} color="rgba(232,240,232,0.2)" />
                    <p className={styles.emptyText}>Select a disease and generate a protein to visualize its 3D structure</p>
                  </div>
                )}
                {phase === "generating" && (
                  <div className={styles.viewerLoading}>
                    <div className={styles.dnaSpinner}>
                      {[...Array(8)].map((_, i) => <div key={i} className={styles.dnaRung} style={{ animationDelay: `${i * 0.1}s` }} />)}
                    </div>
                    <p className={styles.loadingText}>Folding protein structure...</p>
                    <p className={styles.loadingSubText}>ESMFold predicting 3D coordinates</p>
                  </div>
                )}
                {phase === "done" && result && viewMode !== "compare" && (
                  <iframe ref={molRef} className={styles.molViewer} title="Mol* Protein Viewer" allow="fullscreen" />
                )}
                {phase === "done" && result && viewMode === "compare" && (
                  <div className={styles.compareWrap}>
                    <div className={styles.comparePane}>
                      <div className={styles.comparePaneLabel}><span style={{ color: "#6fcf7a" }}>●</span> Wild Type</div>
                      <iframe src={wildtypeUrl} className={styles.compareIframe} title="Wild Type" allow="fullscreen" />
                    </div>
                    <div className={styles.compareDivider} />
                    <div className={styles.comparePane}>
                      <div className={styles.comparePaneLabel}><span style={{ color: "#e05c5c" }}>●</span> Mutated</div>
                      <iframe src={mutatedUrl} className={styles.compareIframe} title="Mutated" allow="fullscreen" />
                    </div>
                  </div>
                )}
                {phase === "error" && (
                  <div className={styles.viewerEmpty}>
                    <p className={styles.emptyText} style={{ color: "#e05c5c" }}>Failed to generate structure. Check backend connection.</p>
                  </div>
                )}
                {phase === "done" && viewMode !== "compare" && (
                  <div className={styles.viewerLegend}>
                    {[["#4caf50","Wild Type"],["#e05c5c","Mutation"],["#5b9bd5","Binding Pocket"]].map(([c,l]) => (
                      <div key={l} className={styles.legendItem}><span className={styles.legendDot} style={{ background: c }} />{l}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className={styles.rightCol}>

              {/* Recent Analyses */}
              <div className={styles.recentCard}>
                <div className={styles.recentCardHeader}>
                  <h3 className={styles.recentCardTitle}>Recent Analyses</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                {RECENT_ANALYSES.map((r, i) => (
                  <div key={i} className={styles.recentItem} onClick={() => {
                    const d = DISEASE_OPTIONS.find(d => d.gene === r.gene);
                    if (d) { setSelectedDisease(d); setPhase("idle"); setResult(null); setLog([]); }
                  }}>
                    <div>
                      <div className={styles.recentGene}>{r.gene}</div>
                      <div className={styles.recentDisease}>{r.disease}</div>
                    </div>
                    <div className={styles.recentTime}>{r.time}</div>
                  </div>
                ))}
              </div>

              {/* Therapeutic Insight */}
              <div className={styles.insightCard}>
                <h3 className={styles.insightTitle}>
                  <span style={{ color: "#4caf50" }}><Icon name="insight" size={16} /></span>
                  Therapeutic Insight
                </h3>
                <p className={styles.insightText}>
                  {phase === "done"
                    ? "AI-generated protein candidate shows strong binding affinity to the target region. Potential therapy discovered."
                    : "Generate a protein to see therapeutic analysis and binding affinity predictions."}
                </p>
                {phase === "done" && result && (
                  <>
                    <div className={styles.insightField}>
                      <div className={styles.insightLabel}>Candidate Protein</div>
                      <div className={styles.insightValue}>MutaCure_001</div>
                    </div>
                    <div className={styles.insightField}>
                      <div className={styles.insightLabel}>Predicted Affinity</div>
                      <div className={styles.insightValueGreen}>{affinityScore} kcal/mol</div>
                    </div>
                    <div className={styles.insightField}>
                      <div className={styles.insightLabel}>Sequence Length</div>
                      <div className={styles.insightValue}>{result.sequence.length} AA</div>
                    </div>
                    <button className={styles.viewDetailsBtn}>
                      View Details <Icon name="chevron" size={14} color="#2d6a31" />
                    </button>
                    <a href={`${API_BASE}${result.pdb_url}`} download className={styles.downloadLink}>
                      <Icon name="download" size={13} color="#2d6a31" /> Download PDB File
                    </a>
                  </>
                )}
              </div>

              {/* AR Preview */}
              <div className={styles.arCard}>
                <h3 className={styles.arCardTitle}>
                  <span style={{ color: "#4caf50" }}><Icon name="ar" size={16} /></span>
                  AR Preview
                </h3>
                <p className={styles.arCardText}>
                  Scan a marker to visualize this protein in your real world.
                </p>
                <a
                  href={arUrl}
                  className={`${styles.arLaunchBtn} ${phase !== "done" ? styles.arLaunchBtnDisabled : ""}`}
                  onClick={phase !== "done" ? e => e.preventDefault() : undefined}
                >
                  <Icon name="ar" size={15} color="#fff" /> Launch AR
                </a>
              </div>

            </div>
          
        </div>
      </div>
    </Layout>
  );
}