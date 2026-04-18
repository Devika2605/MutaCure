// pages/protein.jsx
import Head from "next/head";
import ProteinViewer from "../components/protein/ProteinViewer";

export default function ProteinPage() {
  return (
    <>
      <Head>
        <title>Protein Explorer — MutaCure AR</title>
        <meta name="description" content="3D protein structure prediction and AR visualization" />
      </Head>
      <ProteinViewer />
    </>
  );
}