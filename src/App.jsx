import { useState, useEffect } from 'react';
import './App.css';

// --- CONFIGURATION ---
const FONDATEUR = "MR MOHAMED MORCHID (964 R/1970)";
const MAX_MONTHLY_REVENUE = 50000;

const TAUX_CHANGE = {
  "MAD": 1, "USD": 10.5, "EUR": 11.2, "GBP": 13.4, "CAD": 7.8,
  "SAR": 2.8, "AED": 2.9, "USDT": 10.6, "E2 (Polygon)": 5.5,
  "BTC": 980000, "ETH": 35000
};

const VALEUR_BASE_MINUTE = 7.00;
const VALEUR_CACHE_MINUTE = 3.50;
const COUT_OUTIL_IA = 1.50;

// ===== UTILITAIRES =====
const genererID = (nom) => {
  try {
    const clean = nom.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const random = Math.floor(Math.random() * 10000);
    return `ALW-${clean}-${random}-PROFUSION`;
  } catch {
    return `ALW-USR-${Date.now()}-PROFUSION`;
  }
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  clear: () => {
    try { localStorage.clear(); return true; } catch (e) { return false; }
  }
};

// ===== COMPOSANT PRINCIPAL =====
function App() {
  // --- ÉTATS ---
  const [form, setForm] = useState({ nom: "", email: "", docType: "CIN", docNum: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [idCitoyen, setIdCitoyen] = useState("");
  const [brut, setBrut] = useState(0.00);

  const [detteOutil, setDetteOutil] = useState(0.00);
  const [isUsingIA, setIsUsingIA] = useState(false);
  const [choixBanque, setChoixBanque] = useState("CARTE ALWAFRA");
  const [banqueManuelle, setBanqueManuelle] = useState("");
  const [choixDevise, setChoixDevise] = useState("MAD");
  const [prelevementSource, setPrelevementSource] = useState(true);
  const [showCertificat, setShowCertificat] = useState(false);
  const [certifieHonneur, setCertifieHonneur] = useState(false);

  // --- INITIALISATION ---
  useEffect(() => {
    try {
      const savedUser = safeLocalStorage.getItem('alwafra_user');
      const savedRegistered = safeLocalStorage.getItem('alwafra_is_reg', false);
      const savedID = safeLocalStorage.getItem('alwafra_id', "");
      const savedBrut = safeLocalStorage.getItem('alwafra_brut', 0.00);

      if (savedUser) setForm(savedUser);
      if (savedID) setIdCitoyen(savedID);
      if (savedBrut) setBrut(savedBrut);
      if (savedRegistered === true || savedRegistered === 'true') setIsRegistered(true);
    } catch (e) {
      console.error('❌ Initialization error:', e);
    }
  }, []);

  // --- ACCUMULATION DE REVENU ---
  useEffect(() => {
    if (!isRegistered) return;

    const interval = setInterval(() => {
      setBrut(prev => {
        let gain = VALEUR_BASE_MINUTE / 60;
        let gainCache = VALEUR_CACHE_MINUTE / 60;

        if (isUsingIA) {
          const coutIA = COUT_OUTIL_IA / 60;
          gainCache -= coutIA;
          setDetteOutil(d => d + coutIA);
        }

        const newBrut = Math.min(prev + gain + gainCache, MAX_MONTHLY_REVENUE);
        safeLocalStorage.setItem('alwafra_brut', newBrut);
        return newBrut;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRegistered, isUsingIA]);

  // --- VALIDATION ET INSCRIPTION ---
  const validerInscription = (e) => {
    if (e) e.preventDefault();

    if (!certifieHonneur) {
      alert('⚠️ Vous devez accepter les conditions');
      return;
    }
    if (!form.nom || form.nom.length < 3) {
      alert('Le nom doit avoir au moins 3 caractères');
      return;
    }
    if (!validateEmail(form.email)) {
      alert('Email invalide. Format: user@example.com');
      return;
    }
    if (!form.docNum) {
      alert('Numéro de document requis');
      return;
    }

    try {
      const newID = genererID(form.nom);

      safeLocalStorage.setItem('alwafra_user', form);
      safeLocalStorage.setItem('alwafra_id', newID);
      safeLocalStorage.setItem('alwafra_is_reg', 'true');
      safeLocalStorage.setItem('alwafra_brut', 0.00);

      setIdCitoyen(newID);
      setIsRegistered(true);
    } catch (error) {
      console.error("Erreur inscription:", error);
      alert("Une erreur est survenue.");
    }
  };

  const corrigerDossier = () => {
    if (window.confirm("Réinitialiser votre dossier ?")) {
      safeLocalStorage.clear();
      setForm({ nom: "", email: "", docType: "CIN", docNum: "" });
      setIsRegistered(false);
      setIdCitoyen("");
      setBrut(0);
    }
  };

  // --- CALCULS ---
  const impot = prelevementSource ? (brut * 0.15) : 0.00;
  const service = brut * 0.30;
  const net = Math.max(0, brut - impot - service - detteOutil);
  const netConverti = (net / TAUX_CHANGE[choixDevise]).toFixed(4);
  const getBanqueFinale = () => choixBanque === "AUTRE" ? banqueManuelle.toUpperCase() : choixBanque;

  // --- STYLES ---
  const styles = {
    container: { background: "#050505", color: "#e0e0e0", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif", padding: "20px" },
    input: { display: "block", width: "100%", padding: "12px", marginBottom: "10px", background: "#222", border: "1px solid #444", color: "white", borderRadius: "5px" },
    select: { display: "block", width: "100%", padding: "12px", marginBottom: "15px", background: "#111", border: "1px solid #00ff41", color: "white", borderRadius: "5px", fontSize: "1rem" },
    card: { background: "#111", padding: "20px", borderRadius: "10px", border: "1px solid #333", marginBottom: "20px" },
    btnGreen: { background: "#00ff41", color: "black", width: "100%", padding: "15px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", fontSize: "1.2rem", border:"none", marginTop: "15px" },
    langBtn: { padding: "5px 10px", border: "1px solid #666", background: "transparent", color: "white", cursor: "pointer", marginLeft: "5px" },
    modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    papier: { background: "white", color: "black", width: "90%", maxWidth: "600px", padding: "40px", borderRadius: "5px", fontFamily: "Times New Roman", overflowY: "auto", maxHeight: "90vh" }
  };

  // --- AFFICHAGE INSCRIPTION ---
  if (!isRegistered) {
    return (
      <div style={styles.container}>
        <h2 style={{color: "#00ff41", textAlign: "center"}}>ALWAFRA PROFUSION</h2>
        <p style={{textAlign:"center", color:"#888", fontSize:"0.8rem"}}>Registre Universel des Droits de l'Homme</p>

        <input style={styles.input} placeholder="Nom complet" onChange={e => setForm({...form, nom: e.target.value})} />
        <input style={styles.input} placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />

        <select style={styles.select} onChange={e => setForm({...form, docType: e.target.value})}>
          <option value="CIN">Carte Nationale (CIN)</option>
          <option value="PASSEPORT">Passeport International</option>
          <option value="REFUGIE">Carte de Réfugié</option>
        </select>

        <input style={styles.input} placeholder="Numéro du document" onChange={e => setForm({...form, docNum: e.target.value})} />

        <div style={{display:"flex", alignItems:"center", gap:"10px", margin:"20px 0"}}>
          <input type="checkbox" checked={certifieHonneur} onChange={e => setCertifieHonneur(e.target.checked)} />
          <label style={{fontSize:"0.8rem"}}>J'accepte les Conditions et la Charte des Droits.</label>
        </div>

        <button onClick={validerInscription} style={styles.btnGreen}>SIGNER LE REGISTRE</button>
      </div>
    );
  }

  // --- AFFICHAGE DASHBOARD ---
  return (
    <div style={styles.container}>
      {/* MODAL CERTIFICAT */}
      {showCertificat && (
        <div style={styles.modal}>
          <div style={styles.papier} className="printable-area">
            <button onClick={() => setShowCertificat(false)} style={{float:"right", background:"red", color:"white", border:"none", padding:"5px"}} className="no-print">X</button>
            <h2 style={{textAlign:"center", borderBottom:"2px solid black"}}>CERTIFICAT D'ORIGINE</h2>
            <p><strong>BÉNÉFICIAIRE :</strong> {form.nom.toUpperCase()}</p>
            <p><strong>ID CIVIL :</strong> {form.docNum} / {form.docType}</p>
            <hr/>
            <p>Brut : {brut.toFixed(2)} MAD</p>
            <p>(-) Impôt : {impot.toFixed(2)} MAD</p>
            <p>(-) Commission (30%) : {service.toFixed(2)} MAD</p>
            <p>(-) Dette Outil IA : {detteOutil.toFixed(2)} MAD</p>
            <h2 style={{background:"#eee", padding:"10px"}}>NET : {netConverti} {choixDevise}</h2>
            <p><strong>DESTINATION :</strong> {getBanqueFinale()}</p>
            <div style={{marginTop:"20px", textAlign:"center", fontSize:"0.8rem"}}>{FONDATEUR}</div>
            <button onClick={() => window.print()} style={{width:"100%", padding:"15px", background:"black", color:"white", marginTop:"20px"}} className="no-print">🖨️ IMPRIMER</button>
          </div>
        </div>
      )}

      <div style={{display:"flex", justifyContent:"space-between"}}>
        <h2 style={{color:"#00ff41"}}>ALWAFRA</h2>
      </div>
      <div style={{textAlign: "center", fontSize: "0.8rem", border:"1px solid #00ff41", padding:"5px", margin:"10px 0"}}>{idCitoyen}</div>

      <div style={styles.card}>
        <div style={{textAlign:"center", fontSize:"3rem", fontWeight:"bold"}}>{net.toFixed(2)} MAD</div>
      </div>

      <div style={styles.card}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
          <span>RÉGIME :</span>
          <button onClick={() => setPrelevementSource(!prelevementSource)} style={{padding:"5px", background:prelevementSource?"#00ff41":"#333", color:prelevementSource?"black":"white", border:"none"}}>
            {prelevementSource ? "SOURCE" : "DÉCLARATIF"}
          </button>
        </div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
          <span>OUTIL IA (+Coût) :</span>
          <button onClick={() => setIsUsingIA(!isUsingIA)} style={{padding:"5px", background:isUsingIA?"#00ff41":"#333", color:isUsingIA?"black":"white", border:"none"}}>
            {isUsingIA ? "ACTIF" : "INACTIF"}
          </button>
        </div>
      </div>

      <label style={{fontSize:"0.8rem", color:"#888"}}>CHOIX :</label>
      <select style={styles.select} onChange={(e) => setChoixDevise(e.target.value)}>
        {Object.keys(TAUX_CHANGE).map(d=><option key={d} value={d}>{d}</option>)}
      </select>

      <select style={styles.select} onChange={(e) => setChoixBanque(e.target.value)}>
        <option>CARTE ALWAFRA</option><option>CIH BANK</option><option>CASH PLUS</option><option>AUTRE</option>
      </select>

      {choixBanque === "AUTRE" && (
        <input style={styles.input} placeholder="Nom de la banque..." onChange={(e)=>setBanqueManuelle(e.target.value)}/>
      )}

      <button onClick={() => setShowCertificat(true)} style={styles.btnGreen}>GÉNÉRER LE JUSTIFICATIF</button>

      <button onClick={corrigerDossier} style={{width: "100%", padding: "10px", background: "transparent", color: "#ff6b6b", border: "1px solid #ff6b6b", marginTop: "20px", cursor: "pointer"}}>
        Corriger mon dossier
      </button>
    </div>
  );
}

export default App;