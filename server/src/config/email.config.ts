import nodemailer from "nodemailer";

// Create email transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send invitation email
 */
export const sendInvitationEmail = async (
  email: string,
  inviterName: string,
  noteTitle: string,
  token: string
) => {
  const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept/${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"SyncPad" <noreply@syncpad.com>`,
    to: email,
    subject: `${inviterName} invited you to collaborate on "${noteTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've been invited to collaborate!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p><strong>${inviterName}</strong> has invited you to collaborate on the note: <strong>"${noteTitle}"</strong></p>
            <p>Click the button below to accept the invitation:</p>
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${inviteUrl}</p>
            <p><small>This invitation will expire in 7 days.</small></p>
          </div>
          <div class="footer">
            <p>© 2025 SyncPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
