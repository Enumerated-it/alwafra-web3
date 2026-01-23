# 💰 SYSTÈME DE VERSEMENT AUTOMATIQUE - SPÉCIFICATIONS TECHNIQUES

**Date** : 23 Janvier 2026  
**Version** : 1.0  
**Status** : 📝 À Implémenter (Phase 2)

---

## 📊 ARCHITECTURE DU SYSTÈME

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCUMULATEUR DE REVENU                       │
│              (Commence à 0.00 MAD, accumule 10.5/min)           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Chaque seconde
                       │ +0.175 MAD (10.5 MAD/60 sec)
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Plafond mensuel atteint ?    │
        │ (50,000 MAD par défaut)      │
        └──────────┬───────────────────┘
                   │
        ┌──────────▼──────────┐
        │ NON → Continuer     │
        │ OUI ↓               │
        └─────────────────────┘
                   │
                   ▼
     ┌─────────────────────────────────┐
     │  🔄 DÉCLENCHER VERSEMENT AUTO   │
     │                                 │
     │  1️⃣ Cadenasser l'accumulateur  │
     │  2️⃣ Créer transaction          │
     │  3️⃣ Passer en mode ARCHIVAGE   │
     │  4️⃣ Notifier utilisateur        │
     └─────────────────────────────────┘
```

---

## 🎯 ÉTAPES DÉTAILLÉES DU SYSTÈME

### **ÉTAPE 1 : Accumulation Continue**

```javascript
// Accumulateur s'incrémente chaque seconde
useEffect(() => {
  const interval = setInterval(() => {
    setBrut(prev => prev + (VALEUR_BASE_MINUTE / 60) + (VALEUR_CACHE_MINUTE / 60));
    
    // Vérifier si plafond atteint
    if (brut >= MAX_MONTHLY_REVENUE) {
      triggerAutoPayout();  // 🔴 À CRÉER
    }
  }, 1000);
  return () => clearInterval(interval);
}, [brut]);
```

### **ÉTAPE 2 : Détection du Plafond**

```javascript
const triggerAutoPayout = async () => {
  // ✅ Vérifications
  if (brut < MAX_MONTHLY_REVENUE) return; // Encore assez bas
  
  const lastPayoutDate = localStorage.getItem('alwafra_last_payout');
  const daysSincePayout = Math.floor((Date.now() - lastPayoutDate) / (1000 * 60 * 60 * 24));
  
  // Versement auto possible après 90 jours
  if (daysSincePayout >= AUTO_PAYOUT_DAYS) {
    await executePayout(brut);
  }
};
```

### **ÉTAPE 3 : Exécution du Versement**

```javascript
const executePayout = async (amount) => {
  try {
    // 1️⃣ Sauvegarder état
    const payoutRecord = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount,
      status: 'PENDING',
      destination: ALWAFRA_WALLET_ADDRESS,
      userWallet: form.email // Pour traçabilité
    };
    
    // 2️⃣ Sauvegarder en localStorage (archivage)
    const payoutHistory = JSON.parse(localStorage.getItem('alwafra_payouts')) || [];
    payoutHistory.push(payoutRecord);
    localStorage.setItem('alwafra_payouts', JSON.stringify(payoutHistory));
    
    // 3️⃣ Réinitialiser accumulateur
    setBrut(0);
    localStorage.setItem('alwafra_brut', '0');
    localStorage.setItem('alwafra_last_payout', Date.now().toString());
    
    // 4️⃣ Notifier utilisateur
    showNotification(`✅ Versement de ${amount.toFixed(2)} MAD effectué vers wallet Alwafra`);
    
    // 5️⃣ Envoyer au backend (futures transactions blockchain)
    // await api.recordPayout(payoutRecord);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur versement :', error);
    showNotification('❌ Erreur lors du versement. Contactez support.');
    return false;
  }
};
```

---

## 📋 ÉTATS POSSIBLES D'UN UTILISATEUR

### **ÉTAT 1 : Accumulation**
```
├─ Statut: ACCUMULATING
├─ Solde: 0 - 50,000 MAD
├─ Action: Accumule chaque seconde
└─ Délai versement: X jours restants
```

### **ÉTAT 2 : Plafond Atteint**
```
├─ Statut: THRESHOLD_REACHED
├─ Solde: 50,000+ MAD
├─ Action: Bloqué (en attente 90 jours)
├─ Délai versement: 90 - Y jours
└─ 🔴 Attention: Revenu gelé temporairement
```

### **ÉTAT 3 : Archivé (Passé à Wallet)**
```
├─ Statut: ARCHIVED
├─ Solde: Réinitialisé à 0
├─ Montant archivé: Stocké en sécurité
├─ Location: Wallet Alwafra (sans limite)
├─ Options: Transférer vers banque 24h/24
└─ ✅ Revenu reprend accumulation
```

---

## 🔄 CHRONOLOGIE EXEMPLE

```
📅 JOUR 1 (Lundi)
├─ 8:00  : Utilisateur s'inscrit (Brut = 0 MAD)
├─ 18:00 : Brut = 8 × 10.5 × 60 = 5,040 MAD
└─ Status: ACCUMULATING

📅 JOUR 5 (Vendredi)
├─ Brut ≈ 50,400 MAD
├─ Status: ⚠️ THRESHOLD_REACHED
├─ Utilisateur reçoit notification
├─ Revenu gelé jusqu'au 23 Janvier (90j)
└─ 🔴 Impossible d'accumuler plus

📅 JOUR 91 (Jeudi, 3 mois plus tard)
├─ Condition: Brut ≥ 50,000 ET 90+ jours
├─ Action: Versement AUTO
│   ├─ 50,000 MAD → Wallet Alwafra
│   ├─ Historique archivé
│   └─ Brut réinitialisé à 0
├─ Email: "Versement effectué"
└─ ✅ Accumulation reprend normalement
```

---

## 💳 OPTIONS DE VERSEMENT DEPUIS WALLET ALWAFRA

### **Option A : Transfert vers Banque**
```
Wallet Alwafra (50,000 MAD)
        ↓
    Convertir en devises
        ↓
    ├─ MAD      (1:1)
    ├─ USD      (1:10.5)
    ├─ EUR      (1:11.2)
    └─ Autres
        ↓
    Compte bancaire (CIH, CASA+, etc.)
        ↓
    ✅ Reçu en 24-48h
```

### **Option B : Retrait Cash**
```
Wallet Alwafra (50,000 MAD)
        ↓
    Chercher distributeur ATM Alwafra
        ↓
    Retrait jusqu'à limite daily
        ↓
    ✅ Argent liquide en main
```

### **Option C : Achat Crypto**
```
Wallet Alwafra (50,000 MAD)
        ↓
    Swap MAD → BTC/ETH/USDT
        ↓
    Wallet Crypto personnel
        ↓
    ✅ Transactions blockchain
```

---

## 🛠️ IMPLÉMENTATION CODE COMPLÈTE

### Fichier : `src/hooks/useAlwafraFinance.js`

```javascript
import { useState, useEffect, useCallback } from 'react';

const VALEUR_BASE_MINUTE = 7.00;
const VALEUR_CACHE_MINUTE = 3.50;
const MAX_MONTHLY_REVENUE = 50000;
const AUTO_PAYOUT_DAYS = 90;

export const useAlwafraFinance = () => {
  const [brut, setBrut] = useState(() => parseFloat(localStorage.getItem('alwafra_brut')) || 0);
  const [payoutHistory, setPayoutHistory] = useState(() => 
    JSON.parse(localStorage.getItem('alwafra_payouts')) || []
  );
  const [isThresholdReached, setIsThresholdReached] = useState(false);
  const [daysSinceLastPayout, setDaysSinceLastPayout] = useState(0);

  // 🔄 Boucle d'accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBrut(prev => {
        const newBrut = prev + (VALEUR_BASE_MINUTE / 60) + (VALEUR_CACHE_MINUTE / 60);
        localStorage.setItem('alwafra_brut', newBrut.toString());
        return newBrut;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⚠️ Vérifier seuil
  useEffect(() => {
    if (brut >= MAX_MONTHLY_REVENUE) {
      setIsThresholdReached(true);
    }
  }, [brut]);

  // 📅 Calculer jours depuis dernier payout
  useEffect(() => {
    const lastPayout = localStorage.getItem('alwafra_last_payout');
    if (!lastPayout) return;

    const daysSince = Math.floor((Date.now() - parseInt(lastPayout)) / (1000 * 60 * 60 * 24));
    setDaysSinceLastPayout(daysSince);

    // Déclencher payout auto si conditions remplies
    if (daysSince >= AUTO_PAYOUT_DAYS && isThresholdReached) {
      executePayout();
    }
  }, [isThresholdReached]);

  // ✅ Exécuter versement
  const executePayout = useCallback(async () => {
    try {
      const payoutRecord = {
        id: `PAY-${Date.now()}`,
        date: new Date().toISOString(),
        amount: Math.floor(brut),
        status: 'COMPLETED',
        destination: 'WALLET_ALWAFRA'
      };

      const newHistory = [...payoutHistory, payoutRecord];
      setPayoutHistory(newHistory);
      localStorage.setItem('alwafra_payouts', JSON.stringify(newHistory));
      localStorage.setItem('alwafra_brut', '0');
      localStorage.setItem('alwafra_last_payout', Date.now().toString());

      setBrut(0);
      setIsThresholdReached(false);

      return true;
    } catch (error) {
      console.error('Erreur payout:', error);
      return false;
    }
  }, [brut, payoutHistory]);

  return {
    brut,
    payoutHistory,
    isThresholdReached,
    daysSinceLastPayout,
    daysUntilPayout: Math.max(0, AUTO_PAYOUT_DAYS - daysSinceLastPayout),
    executePayout
  };
};
```

---

## 📊 TABLEAU DE BORD UTILISATEUR

```
╔════════════════════════════════════════════════════╗
║          ALWAFRA FINANCE DASHBOARD                 ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  💰 ACCUMULATION ACTUELLE                         ║
║  ├─ Solde brut : 23,456.78 MAD                   ║
║  ├─ Revenu/min : 10.50 MAD                       ║
║  └─ Revenu/jour : 15,120 MAD                     ║
║                                                   ║
║  ⚠️  SEUIL PLAFOND                                ║
║  ├─ Limite mensuelle : 50,000 MAD                ║
║  ├─ Progression : ████░░░░░░ 47%                 ║
║  └─ À atteindre : +26,543 MAD (2.5 jours)       ║
║                                                   ║
║  🔄 VERSEMENT AUTO                                ║
║  ├─ Status : 🟢 Enabled                          ║
║  ├─ Prochaine éligibilité : +65 jours            ║
║  └─ Destination : Wallet Alwafra                 ║
║                                                   ║
║  📦 ARCHIVAGE (Wallet Alwafra)                    ║
║  ├─ Total archivé : 50,000 MAD                   ║
║  ├─ Date : 2026-01-15 14:30                      ║
║  └─ Action : Transférer vers banque              ║
║                                                   ║
║  🏦 OPTIONS DE RETRAIT                            ║
║  ├─ [ ] Vers compte bancaire                     ║
║  ├─ [ ] Retrait cash ATM                         ║
║  └─ [ ] Achat crypto (BTC/ETH)                   ║
║                                                   ║
╚════════════════════════════════════════════════════╝
```

---

## ⏰ MINUTAGES CRITIQUES

| Phase | Condition | Délai | Action |
|-------|-----------|-------|--------|
| Accumulation | Brut < 50k | ∞ | Continue |
| Seuil atteint | Brut ≥ 50k | 0s | Notifier |
| **Attente** | **Brut ≥ 50k** | **90 jours** | **Bloqué** |
| **Versement** | **Jour 90+** | **Immédiat** | **Vers Wallet** |
| Réaccumulation | Brut = 0 | ∞ | Reprend |

---

## 🔐 SÉCURITÉ DU VERSEMENT

```javascript
// Validation stricte avant versement
const validatePayout = (amount, lastPayout) => {
  const checks = [
    amount >= MAX_MONTHLY_REVENUE ? '✅' : '❌ Montant insuffisant',
    Date.now() - lastPayout >= AUTO_PAYOUT_DAYS * 86400000 ? '✅' : '❌ Délai insuffisant',
    localStorage.getItem('alwafra_is_reg') === 'true' ? '✅' : '❌ Non enregistré',
    amount <= 1000000 ? '✅' : '❌ Montant suspect'
  ];
  
  return checks.every(c => c === '✅');
};
```

---

## 📞 NOTIFICATIONS UTILISATEUR

### 🔔 Notification 1 : Seuil Atteint
```
ALERTE ⚠️
Votre accumulation a atteint 50,000 MAD.
Versement programmé pour le 2026-02-13 (90 jours).
Votre revenu restera gelé jusqu'à ce moment.
```

### 🔔 Notification 2 : Versement Effectué
```
✅ VERSEMENT RÉUSSI
Montant : 50,000 MAD
Destination : Wallet Alwafra
Date : 2026-02-13 15:45
Référence : PAY-1234567890

Prochaines étapes :
1. Transférer vers banque (24-48h)
2. Ou retirer en cash ATM
3. Ou convertir en crypto
```

---

## 🚀 DÉPLOIEMENT & TESTS

### Tests à faire :
```
[ ] Accumulation correcte (10.5 MAD/min)
[ ] Détection seuil 50k
[ ] Notification utilisateur
[ ] Versement après 90j
[ ] Réinitialisation brut à 0
[ ] Historique archivé correctement
[ ] localStorage persist après refresh
[ ] Pas de perte données
```

---

## 📝 PROCHAINES ÉTAPES

1. ✅ **Spécifications** (ce document)
2. 🔴 **Code** (src/hooks/useAlwafraFinance.js)
3. 🔴 **Tests** (useAlwafraFinance.test.js)
4. 🔴 **UI Dashboard** (component PaiementAuto)
5. 🔴 **Backend** (API /api/payout)
6. 🔴 **Smart Contract** (versement blockchain)

---

**Status** : 📝 En attente d'implémentation code → Prêt à démarrer Phase 2
