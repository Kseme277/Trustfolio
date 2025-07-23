#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de TrustFolio avec service WhatsApp...');

// Initialiser WhatsApp en arrière-plan
const whatsappProcess = spawn('node', [
  path.join(__dirname, '../src/lib/whatsappService.js')
], {
  stdio: 'pipe',
  detached: true
});

whatsappProcess.stdout.on('data', (data) => {
  console.log('📱 WhatsApp:', data.toString());
});

whatsappProcess.stderr.on('data', (data) => {
  console.error('❌ WhatsApp Error:', data.toString());
});

// Démarrer l'application Next.js
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des services...');
  whatsappProcess.kill();
  nextProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt des services...');
  whatsappProcess.kill();
  nextProcess.kill();
  process.exit(0);
}); 