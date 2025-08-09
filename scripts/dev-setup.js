#!/usr/bin/env node

/**
 * Script de configuration pour l'environnement de développement TrustFolio
 * Ce script aide à configurer l'environnement de développement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configuration de l\'environnement de développement TrustFolio...');

// Vérifier si .env.local existe
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Création du fichier .env.local à partir de .env.example...');
  fs.copyFileSync(envExamplePath, envLocalPath);
  console.log('✅ Fichier .env.local créé. Veuillez le configurer avec vos vraies valeurs.');
} else {
  console.log('✅ Fichier .env.local existe déjà.');
}

// Vérifier si le dossier uploads existe
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('📁 Création du dossier uploads...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Dossier uploads créé.');
} else {
  console.log('✅ Dossier uploads existe déjà.');
}

// Vérifier si le dossier logs existe
const logsPath = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsPath)) {
  console.log('📁 Création du dossier logs...');
  fs.mkdirSync(logsPath, { recursive: true });
  console.log('✅ Dossier logs créé.');
} else {
  console.log('✅ Dossier logs existe déjà.');
}

console.log('\n🎉 Configuration terminée!');
console.log('\n📋 Prochaines étapes:');
console.log('1. Configurez votre base de données PostgreSQL');
console.log('2. Modifiez le fichier .env.local avec vos vraies valeurs');
console.log('3. Exécutez: npm run db:generate && npm run db:migrate');
console.log('4. Exécutez: npm run dev pour démarrer le serveur de développement');
console.log('\n📚 Documentation disponible dans le dossier docs/');