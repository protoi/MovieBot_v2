let axios = require("axios");
const { request, response } = require("express");
let logger = require("winston");
const get_onboarding_qrcode = async (req, res) => {
    let qr_code_link = `${process.env.WHATSAPP_TEST_NUMBER_LINK}`;
    try {
        /* res.writeHead(302, {
          location: qr_code_link,
          link: qr_code_link,
        });
        logger.debug(`Image link is ${qr_code_link}`)
        res.end(); */
        res.status(200).send(qr_code_link);
    }
    catch (err) {
        logger.error(err.message);
        res.send(err.message);
    }
};

module.exports = { get_onboarding_qrcode };
