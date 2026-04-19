// context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CTX = createContext(null);

const DEFAULTS = {
  doctor: {
    role: "doctor",
    name: "Dr. Santos",
    email: "santos@mutacure.ai",
    specialty: "Genomic Medicine",
    institution: "MutaCure Research Institute",
    initials: "DS",
  },
  patient: {
    role: "patient",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    specialty: "Patient",
    institution: "—",
    initials: "AJ",
  },
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULTS.doctor);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mutacure_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("mutacure_user", JSON.stringify(user)); } catch (_) {}
  }, [user, ready]);

  const switchRole = (role) => setUser(DEFAULTS[role]);
  const updateUser = (fields) => setUser(p => ({ ...p, ...fields }));

  if (!ready) return null;

  return (
    <CTX.Provider value={{ user, switchRole, updateUser }}>
      {children}
    </CTX.Provider>
  );
}

export function useUser() {
  const ctx = useContext(CTX);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}