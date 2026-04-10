import { Resend } from 'resend';

// Initialise l'instance Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email de notification à un worker assigné via Resend API (HTTP, non bloqué par Render).
 * @param {string} to       - Adresse email du worker
 * @param {string} name     - Nom complet du worker
 * @param {object} notif    - Objet notification (type, message, machine)
 */
export const sendAssignmentEmail = async (to, name, notif) => {
  const typeLabel = {
    panne: '🔧 Panne machine',
    remplissage: '🗑️ Bac plein (100%)',
    alerte_80: '⚠️ Bac à 80% de capacité',
  };

  const subject = `RVM – Nouvelle tâche assignée : ${typeLabel[notif.type] || notif.type}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a73e8; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">♻️ Système RVM</h1>
        <p style="color: #c8e6fa; margin: 4px 0 0;">Notification d'intervention</p>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 16px;">Bonjour <strong>${name}</strong>,</p>
        <p>Une nouvelle tâche vous a été assignée :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px 14px; font-weight: bold; width: 140px;">Type</td>
            <td style="padding: 10px 14px;">${typeLabel[notif.type] || notif.type}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold;">Machine</td>
            <td style="padding: 10px 14px;">${notif.machineName || 'N/A'} (${notif.machineId || 'N/A'})</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px 14px; font-weight: bold;">Ville</td>
            <td style="padding: 10px 14px;">${notif.machineCity || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold;">Message</td>
            <td style="padding: 10px 14px;">${notif.message}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px 14px; font-weight: bold;">Date</td>
            <td style="padding: 10px 14px;">${new Date().toLocaleString('fr-FR')}</td>
          </tr>
        </table>
        <p style="color: #555; font-size: 13px;">Merci de prendre en charge cette intervention dans les meilleurs délais.</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 14px; text-align: center; font-size: 12px; color: #888;">
        Ce message est généré automatiquement par le système RVM. Ne pas répondre.
      </div>
    </div>
  `;

  // Avec le plan gratuit Resend, l'email envoyé par défaut est à partir de onboarding@resend.dev
  // Note : Il ne peut envoyer QUE vers l'adresse email associée au compte Resend, donc c'est parfait pour ton test !
  const { data, error } = await resend.emails.send({
    from: 'RVM System <onboarding@resend.dev>',
    to: [to],
    subject: subject,
    html: html,
  });

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
