// config.js
require('dotenv').config();

module.exports = {
  ocean: {
    apiKey: process.env.HUNTER_API_KEY,
    baseUrl: 'https://api.ocean.io/v1'
  },
  prospeo: {
    apiKey: process.env.PROSPEO_API_KEY,
    baseUrl: 'https://api.prospeo.io'
  },
  eazyreach: {
    apiKey: process.env.EAZYREACH_API_KEY,
    baseUrl: 'https://api.eazyreach.app/v1'
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    baseUrl: 'https://api.brevo.com/v3'
  },
  sender: {
    email: process.env.SENDER_EMAIL,
    name: process.env.SENDER_NAME
  }
};