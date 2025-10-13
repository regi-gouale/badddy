export class EmailTemplates {
  /**
   * Template pour l'email de vérification
   */
  static verification(userName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre compte</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 32px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 12px;
      margin-top: 20px;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎯 Badddy</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${userName} !</h2>
      <p>Merci de vous être inscrit sur Badddy. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Vérifier mon compte</a>
      </div>
      <p>Ou copiez et collez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
      <div class="warning">
        <strong>⚠️ Important :</strong> Ce lien expirera dans 24 heures. Si vous n'avez pas demandé cette vérification, ignorez cet email.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Badddy. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Template pour l'email de réinitialisation de mot de passe
   */
  static resetPassword(userName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 32px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #DC2626;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #B91C1C;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background-color: #FEE2E2;
      border-left: 4px solid #DC2626;
      padding: 12px;
      margin-top: 20px;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎯 Badddy</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${userName},</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
      </div>
      <p>Ou copiez et collez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
      <div class="warning">
        <strong>⚠️ Sécurité :</strong> Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et contacter notre support.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Badddy. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Template pour l'email de bienvenue
   */
  static welcome(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Badddy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 32px;
    }
    .content {
      margin-bottom: 30px;
    }
    .features {
      background-color: #F3F4F6;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .feature-item {
      margin: 10px 0;
      padding-left: 25px;
      position: relative;
    }
    .feature-item:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10B981;
      font-weight: bold;
      font-size: 18px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎯 Badddy</h1>
    </div>
    <div class="content">
      <h2>Bienvenue ${userName} ! 🎉</h2>
      <p>Nous sommes ravis de vous accueillir dans la communauté Badddy. Votre compte est maintenant activé et vous pouvez profiter de toutes nos fonctionnalités.</p>
      
      <div class="features">
        <h3 style="margin-top: 0; color: #4F46E5;">Ce que vous pouvez faire maintenant :</h3>
        <div class="feature-item">Accéder à votre tableau de bord personnalisé</div>
        <div class="feature-item">Configurer votre profil</div>
        <div class="feature-item">Explorer toutes les fonctionnalités</div>
        <div class="feature-item">Rejoindre notre communauté</div>
      </div>

      <div style="text-align: center;">
        <a href="https://app.badddy.com/dashboard" class="button">Accéder à mon dashboard</a>
      </div>

      <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à consulter notre centre d'aide ou à contacter notre équipe de support.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Badddy. Tous droits réservés.</p>
      <p>Vous recevez cet email car vous vous êtes inscrit sur Badddy.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Template générique pour notifications
   */
  static notification(
    userName: string,
    title: string,
    message: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 32px;
    }
    .content {
      margin-bottom: 30px;
    }
    .message-box {
      background-color: #F3F4F6;
      border-left: 4px solid #4F46E5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎯 Badddy</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${userName},</h2>
      <div class="message-box">
        <p>${message}</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Badddy. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
