const { resendClient, sender } = require("../utils/resend");
const { createVerifyEmailTemplate } = require("./emailTemplates");

async function sendVerifyEmail(to, name, verifyLink) {
  await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to,
    subject: "אימות מייל – QB",
    html: createVerifyEmailTemplate(name, verifyLink),
  });
}

module.exports = { sendVerifyEmail };
