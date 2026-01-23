/**
 * Validation stricte des données utilisateur - PHASE 1 SÉCURITÉ
 * Regex patterns pour sécurité maximale OWASP
 */

// Patterns regex validés pour production
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
  document: /^[A-Z0-9]{6,20}$/,
  phoneMaroc: /^(\+212|0)[67]\d{8}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  alphanumeric: /^[a-zA-Z0-9_-]+$/
};

/**
 * Valide un nom (min 2 chars, pas de caractères spéciaux dangereux)
 * @param {string} nom - Nom à valider
 * @returns {Object} {isValid: boolean, error: string}
 */
export const validateNom = (nom) => {
  if (!nom || typeof nom !== 'string') {
    return { isValid: false, error: "Le nom est obligatoire." };
  }
  
  const trimmed = nom.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: "Le nom doit contenir au moins 2 caractères." };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: "Le nom ne peut pas dépasser 50 caractères." };
  }
  
  if (!PATTERNS.name.test(trimmed)) {
    return { isValid: false, error: "Le nom contient des caractères invalides." };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {Object} {isValid: boolean, error: string}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: "L'email est obligatoire." };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!PATTERNS.email.test(trimmed)) {
    return { isValid: false, error: "L'adresse email est invalide." };
  }
  
  if (trimmed.length > 255) {
    return { isValid: false, error: "L'email ne peut pas dépasser 255 caractères." };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valide un numéro de document d'identité
 * @param {string} docNum - Numéro de document
 * @param {string} docType - Type de document
 * @returns {Object} {isValid: boolean, error: string}
 */
export const validateDocNum = (docNum, docType = "CIN") => {
  if (!docNum || typeof docNum !== 'string') {
    return { isValid: false, error: "Le numéro de document est obligatoire." };
  }
  
  const trimmed = docNum.trim().toUpperCase();
  
  const validationRules = {
    CIN: { regex: /^[A-Z0-9]{13}$/, msg: "CIN doit contenir 13 caractères alphanumériques." },
    PASSEPORT: { regex: /^[A-Z]{2}[0-9]{6}$/, msg: "Passeport invalide (format: 2 lettres + 6 chiffres)." },
    SEJOUR: { regex: /^[A-Z0-9]{9}$/, msg: "Carte de séjour doit contenir 9 caractères." },
    REFUGIE: { regex: /^UN[0-9]{7}$/, msg: "Carte réfugié invalide (format: UN + 7 chiffres)." },
    DETENU: { regex: /^[0-9]{6,10}$/, msg: "Matricule pénitentiaire invalide (6-10 chiffres)." }
  };
  
  const rule = validationRules[docType];
  if (!rule) {
    return { isValid: false, error: `Type de document non reconnu: ${docType}` };
  }
  
  if (!rule.regex.test(trimmed)) {
    return { isValid: false, error: rule.msg };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valide un montant financier
 * @param {number} montant - Montant à valider
 * @returns {Object} {isValid: boolean, error: string}
 */
export const validateMontant = (montant) => {
  if (typeof montant !== 'number' || montant < 0) {
    return { isValid: false, error: "Le montant doit être un nombre positif." };
  }
  
  if (montant > 999999999.99) {
    return { isValid: false, error: "Le montant ne peut pas dépasser 999,999,999.99 MAD." };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valide un code devise
 * @param {string} devise - Code devise (USD, EUR, etc.)
 * @param {Object} tauxChange - Taux de change disponibles
 * @returns {Object} {isValid: boolean, error: string}
 */
export const validateDevise = (devise, tauxChange) => {
  if (!devise || typeof devise !== 'string') {
    return { isValid: false, error: "La devise est obligatoire." };
  }
  
  if (!tauxChange[devise]) {
    return { isValid: false, error: `Devise non supportée: ${devise}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valide un formulaire d'inscription complet
 * @param {Object} formData - Données du formulaire
 * @param {boolean} certifie - Certification d'honneur
 * @returns {Object} {isValid: boolean, errors: []}
 */
export const validateInscriptionForm = (formData, certifie = false) => {
  const errors = [];
  
  const nomValidation = validateNom(formData.nom);
  if (!nomValidation.isValid) errors.push(nomValidation.error);
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.push(emailValidation.error);
  
  const docValidation = validateDocNum(formData.docNum, formData.docType);
  if (!docValidation.isValid) errors.push(docValidation.error);
  
  if (!certifie) {
    errors.push("Vous devez accepter les conditions et certifier sur l'honneur.");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Désinfecte une chaîne (XSS prevention)
 * @param {string} str - Chaîne à désinfecter
 * @returns {string} Chaîne sécurisée
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export default {
  validateNom,
  validateEmail,
  validateDocNum,
  validateMontant,
  validateDevise,
  validateInscriptionForm,
  sanitizeString
};
