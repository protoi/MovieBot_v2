/**
 * @module API
 */
let axios = require("axios");
const { Request, Response } = require("express");
let logger = require("winston");

/**
 * Sends a link to the WhatsApp chatbot on-boarding QR Code as a HTTP Response
 * @function
 * @param {Request} request HTTP Response Object
 * @param {Response} response HTTP Response Object
 * @returns {}
 */

const get_onboarding_qrcode = async (req, res) => {
  let qr_code_link = `${process.env.WHATSAPP_TEST_NUMBER_LINK}`;
  try {
    res.status(200).send(qr_code_link);
  } catch (err) {
    logger.error(err.message);
    res.send(err.message);
  }
};

module.exports = { get_onboarding_qrcode };
