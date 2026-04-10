// Script de diagnostic email — exécuter avec: node test-email.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Worker from './models/Worker.js';
import { sendAssignmentEmail } from './config/mailer.js';

async function diagnose() {
  console.log('\n🔍 DIAGNOSTIC EMAIL\n');

  // 1. Vérifier les vars d'env
  console.log('📋 Variables .env :');
  console.log('  MAIL_USER:', process.env.MAIL_USER || '❌ NON DÉFINI');
  console.log('  MAIL_PASS:', process.env.MAIL_PASS ? '✅ défini (' + process.env.MAIL_PASS.length + ' chars)' : '❌ NON DÉFINI');
  console.log('');

  // 2. Connexion MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connecté\n');

  // 3. Chercher worker "ben"
  const worker = await Worker.findOne({ nomcomplet: 'ben' });
  if (!worker) {
    console.log('❌ Worker "ben" introuvable en base !');
  } else {
    console.log('👤 Worker trouvé :');
    console.log('  Nom:', worker.nomcomplet);
    console.log('  Email:', worker.email || '❌ EMAIL NON DÉFINI (null)');
    console.log('  Status:', worker.status);
    console.log('  Role:', worker.role);
    console.log('');
  }

  // 4. Test envoi direct si email dispo
  const targetEmail = worker?.email || process.env.MAIL_USER;
  console.log(`📧 Test envoi vers : ${targetEmail}`);
  try {
    await sendAssignmentEmail(targetEmail, 'Test Worker', {
      type: 'panne',
      message: 'Test de diagnostic email.',
      machineId: 'TEST-01',
      machineName: 'Machine Test',
      machineCity: 'Alger',
    });
    console.log('✅ Email envoyé avec succès !');
  } catch (err) {
    console.log('❌ Erreur envoi email:', err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}

diagnose().catch(console.error);
