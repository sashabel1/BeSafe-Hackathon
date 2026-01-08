
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(to, verifyUrl) {
  await resend.emails.send({
    from: process.env.MAIL_FROM,      // onboarding@resend.dev או noreply@domain
    to,
    subject: "Verify your email",
    html: `
      <p>Click the button to verify:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
    `,
  });
}

module.exports = { sendVerificationEmail };