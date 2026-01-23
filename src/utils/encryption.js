import CryptoJS from 'crypto-js';

// Clé de chiffrement depuis .env.local
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-32-chars-minimum-secure';

/**
 * Chiffre une chaîne de caractères avec AES-256
 * @param {string} data - Données à chiffrer
 * @returns {string} Données chiffrées en base64
 */
export const encrypt = (data) => {
  if (!data) return '';
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Erreur chiffrement:', error);
    return '';
  }
};

/**
 * Déchiffre une chaîne chiffrée avec AES-256
 * @param {string} encryptedData - Données chiffrées
 * @returns {any} Données déchiffrées
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    return null;
  }
};

/**
 * Stockage sécurisé dans localStorage avec chiffrement
 */
export const secureStorage = {
  setItem: (key, value) => {
    const encrypted = encrypt(value);
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(encrypted);
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

export default secureStorage;
