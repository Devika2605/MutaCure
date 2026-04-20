# 🧬 MutaCure AR

**AI-Powered Mutation-to-Therapy Platform with Augmented Reality Visualization**

---

## 📌 What is MutaCure AR?

MutaCure AR is a full-stack clinical genomics platform that takes a disease name or genetic variant as input and walks it through a complete AI pipeline — from mutation detection to 3D protein visualization in augmented reality.

It was built for the healthcare AI space with two distinct user roles: **Clinicians** who need research-grade mutation analysis, and **Patients** who need simplified, actionable insights about their genetic results.

---

## 🧠 How It Works

```
DNA File / Gene Input
        │
        ▼
┌───────────────────┐
│  ClinVar Lookup   │  ← NCBI ClinVar REST API
│  Variant Detection│
│  Risk Scoring     │  ← scikit-learn model
└───────────┬───────┘
            │
            ▼
┌───────────────────┐
│  UniProt Sequence │  ← Real protein sequences
│  Fetch            │
└───────────┬───────┘
            │
            ▼
┌───────────────────┐
│  ESMFold          │  ← Meta AI protein folding
│  Structure        │    (via public API)
│  Prediction       │
└───────────┬───────┘
            │
            ▼
┌───────────────────┐
│  Mol* 3D Viewer   │  ← Interactive browser viewer
│  Wild Type vs     │
│  Mutated Compare  │
└───────────┬───────┘
            │
            ▼
┌───────────────────┐
│  AR.js + A-Frame  │  ← Protein floats above
│  Web AR           │    Hiro marker in camera
└───────────────────┘
```

---

## ✨ Features

### 🔬 Clinician Portal
- **Mutation Analysis** — query any gene via ClinVar, get variant ID, risk score, and target protein
- **DNA File Upload** — real FASTA and VCF file parsing with sequence statistics (GC content, complexity)
- **3D Protein Viewer** — Mol* viewer with Wild Type / Mutated / Side-by-side compare modes
- **Protein Generation** — ESMFold structure prediction from real UniProt sequences
- **Therapy Insights** — AI-generated candidate proteins with binding affinity predictions
- **History** — searchable log of all analyses with export to CSV

### 👤 Patient Portal
- Simplified, jargon-free mutation interpretation
- Condition-specific guidance (Hereditary Breast Cancer, Familial Diabetes, Early-onset Alzheimer's)
- Patient-friendly risk explanation with recommended next steps

### 📱 Augmented Reality
- Web AR using AR.js + A-Frame — no app install required
- Protein structure floats above a printed Hiro marker in real space
- QR code generation for launching AR from phone
- HUD with gene/target/affinity info overlaid on camera feed

### 🔐 Role-Based Access
- Doctor and Patient profiles with localStorage persistence
- Role switching from the avatar dropdown in the topbar
- Nav and content adapt based on active role

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, CSS Modules |
| **Backend** | Python, FastAPI, Uvicorn |
| **Protein Folding** | ESMFold (Meta AI) via public API |
| **Sequence Source** | UniProt REST API |
| **Mutation Data** | NCBI ClinVar REST API |
| **3D Viewer** | Mol* (molstar) |
| **AR** | AR.js, A-Frame, Three.js |
| **ML** | scikit-learn (risk scoring) |
| **Deployment** | Vercel (frontend), HuggingFace Spaces (backend) |

---

## 📁 Project Structure

```
mutacure-ar/
├── backend/
│   ├── mutation/
│   │   ├── clinvar.py          # ClinVar API integration
│   │   ├── risk_model.py       # scikit-learn risk scorer
│   │   └── routes.py           # POST /api/mutate
│   ├── protein/
│   │   ├── generator.py        # UniProt sequence fetcher
│   │   ├── esmfold.py          # ESMFold structure prediction
│   │   └── routes.py           # POST /api/generate-protein
│   ├── shared/
│   │   ├── models.py           # Pydantic request/response models
│   │   └── config.py           # Environment config
│   ├── main.py                 # FastAPI app entry point
│   └── requirements.txt
│
├── frontend/
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar + topbar shell
│   │   ├── Layout.module.css
│   │   └── protein/
│   │       ├── ProteinViewer.jsx
│   │       └── ProteinViewer.module.css
│   ├── context/
│   │   └── UserContext.jsx     # Role-based auth context
│   ├── pages/
│   │   ├── index.jsx           # Dashboard
│   │   ├── mutation.jsx        # Mutation Analysis
│   │   ├── protein.jsx         # Protein Explorer
│   │   ├── upload.jsx          # DNA File Upload
│   │   ├── ar.jsx              # AR Viewer launcher
│   │   ├── insights.jsx        # Therapy Insights
│   │   ├── history.jsx         # Analysis History
│   │   └── settings.jsx        # Settings
│   └── public/
│       └── ar/
│           ├── index.html      # AR.js + A-Frame scene
│           ├── viewer.html     # Mol* standalone viewer
│           └── marker.png      # Hiro AR marker
│
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Devika2605/mutacure-ar.git
cd mutacure-ar
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
HF_API_TOKEN=hf_your_token_here
```

> Get a free token at [huggingface.co](https://huggingface.co) → Settings → Access Tokens

Start the server:
```bash
uvicorn main:app --reload
# Server runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:
```bash
npm run dev
# App runs at http://localhost:3000
```

---

## 🧪 API Reference

### `POST /api/mutate`
Queries ClinVar and runs risk scoring for a given gene.

```json
{
  "gene": "TCF7L2",
  "variant_type": "snv",
  "chromosome": 10
}
```

**Response:**
```json
{
  "gene": "TCF7L2",
  "variant": "rs7903146:C>T",
  "target_protein": "PPARG",
  "risk": 0.87,
  "clinvar_id": "12345"
}
```

---

### `POST /api/generate-protein`
Fetches protein sequence from UniProt and predicts 3D structure via ESMFold.

```json
{
  "target_protein": "PPARG",
  "max_length": 200,
  "apply_mutation": true
}
```

**Response:**
```json
{
  "sequence": "MGETLGDSPIDP...",
  "pdb_url": "/files/protein_a3f2c1b0.pdb",
  "mutation_info": "Arg325Trp",
  "mutated_positions": [324]
}
```

---

## 📱 AR Usage

1. Open the app and run a mutation analysis
2. Go to **AR Viewer** page
3. Scan the QR code with your phone — AR viewer opens in phone browser
4. Point your phone camera at the **Hiro marker** on your laptop screen
5. The 3D protein structure floats above the marker in real space

> **Tip:** Keep the marker well-lit and fill at least 40% of the camera frame for best tracking.

---

## 🧬 Supported File Formats (Upload)

| Format | Extension | What gets parsed |
|--------|-----------|-----------------|
| FASTA | `.fasta`, `.fa` | Sequence, gene name from header |
| VCF | `.vcf` | Variants table, GENE= from INFO field |
| Plain DNA | `.txt`, `.csv` | Raw A/T/C/G sequence |

---

## Context

Built  by  2-person team.

- **Person 1 (Devika):** Backend protein pipeline (ESMFold, UniProt, `/api/generate-protein`) + AR viewer (Mol*, AR.js, marker tracking)
- **Person 2 (Shreya R):** Backend mutation pipeline (ClinVar, risk model, `/api/mutate`) + Next.js frontend UI

**Result: Runner-Up** 🥈

---

## 🙏 Acknowledgements

- [ESMFold](https://esmatlas.com/) by Meta AI for protein structure prediction
- [Mol*](https://molstar.org/) for the 3D molecular visualization
- [AR.js](https://ar-js-org.github.io/AR.js-Docs/) for marker-based web AR
- [UniProt](https://www.uniprot.org/) for protein sequences
- [NCBI ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) for variant data

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---
