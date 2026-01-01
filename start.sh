#!/bin/bash
echo "🔧 Configuration du port public..."
gh codespace ports visibility 3001:public -c $CODESPACE_NAME
echo "🚀 Démarrage de l'application..."
npm run dev
