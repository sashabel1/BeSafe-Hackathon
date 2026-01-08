const { Resend } = require("resend");

const resendClient = new Resend(process.env.RESEND_API_KEY);

const sender = {
  email: process.env.MAIL_FROM,    
  name: process.env.MAIL_FROM_NAME || "QB",
};

module.exports = { resendClient, sender };
