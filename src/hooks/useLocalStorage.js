/**
 * Custom Hook - Secure localStorage with Encryption
 * Gère localStorage de manière sécurisée avec try-catch
 */

import { useState, useEffect, useCallback } from 'react';

// Simple XOR encryption (production: utiliser crypto-js)
const simpleEncrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const simpleDecrypt = (encoded, key) => {
  try {
    const text = atob(encoded);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('❌ Erreur de déchiffrement:', error);
    return null;
  }
};

/**
 * Hook pour gérer localStorage de manière sécurisée
 * @param {string} key - Clé de stockage
 * @param {any} initialValue - Valeur initiale
 * @param {Object} options - {encrypt: boolean, encryptionKey: string}
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { encrypt = false, encryptionKey = 'alwafra_default' } = options;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      let value = item;
      if (encrypt) {
        value = simpleDecrypt(item, encryptionKey);
        if (!value) return initialValue;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error(`❌ Erreur localStorage.getItem(${key}):`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour localStorage
  const setValue = useCallback((value) => {
    try {
      if (typeof window === 'undefined') {
        console.error('localStorage non disponible');
        return;
      }

      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      let stringValue = JSON.stringify(valueToStore);
      if (encrypt) {
        stringValue = simpleEncrypt(stringValue, encryptionKey);
      }
      
      window.localStorage.setItem(key, stringValue);
      setStoredValue(valueToStore);
      
      // Event personnalisé pour synchroniser les onglets
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: stringValue,
          storageArea: window.localStorage
        })
      );
    } catch (error) {
      console.error(`❌ Erreur localStorage.setItem(${key}):`, error);
    }
  }, [key, encrypt, encryptionKey, storedValue]);

  // Fonction pour supprimer
  const removeValue = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`❌ Erreur localStorage.removeItem(${key}):`, error);
    }
  }, [key, initialValue]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          let value = e.newValue;
          if (encrypt) {
            value = simpleDecrypt(e.newValue, encryptionKey);
            if (!value) return;
          }
          setStoredValue(JSON.parse(value));
        } catch (error) {
          console.error('❌ Erreur synchronisation storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, encrypt, encryptionKey]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook pour archiver les données mensuellement
 */
export const useMonthlyArchive = (key, maxValue) => {
  const [archivedData, setArchivedData, clearArchived] = useLocalStorage(
    `${key}_archive`,
    [],
    { encrypt: false }
  );

  const archiveIfNeeded = useCallback((currentValue, currentMonth) => {
    try {
      if (currentValue > maxValue) {
        const newArchive = {
          date: new Date().toISOString(),
          month: currentMonth,
          value: currentValue
        };
        
        setArchivedData(prev => [...prev, newArchive].slice(-12)); // Garder 12 mois
        return newArchive;
      }
    } catch (error) {
      console.error('❌ Erreur archivage:', error);
    }
    return null;
  }, [maxValue, setArchivedData]);

  return {
    archivedData,
    archiveIfNeeded,
    clearArchived
  };
};

export default useLocalStorage;
