// config.js
require('dotenv').config();

module.exports = {
  hunter: {
    apiKey: process.env.HUNTER_API_KEY,
    baseUrl: 'https://api.hunter.io/v2'
  },
  prospeo: {
    apiKey: process.env.PROSPEO_API_KEY,
    baseUrl: 'https://api.prospeo.io'
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    baseUrl: 'https://api.brevo.com/v3'
  },
  companyEnrich: {
    apiKey: process.env.COMPANY_ENRICH_API_KEY,
    baseUrl: 'https://api.companyenrich.com'
  },
  sender: {
    email: process.env.SENDER_EMAIL,
    name: process.env.SENDER_NAME
  }
};