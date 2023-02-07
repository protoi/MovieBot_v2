const axios = require("axios");
const { logger } = require("../logger");
//our classes
const nlp_model = require("../NLP/retain_model");
const WhatsappUtils = require("../WhatsappUtils");
const IMDB = require("../IMDB");

//Objects
const WhatsappUtilsObj = new WhatsappUtils.WhatsappUtils();
const IMDBObj = new IMDB.IMDB();
const model = new nlp_model.NLP();

require("dotenv").config();

const PORT = 9999;
// model.load_model();

const ping = (req, res) => {
  res.send("Hello World");
};

//This function verifies the token sent by whatsapp to configure webhook with the server. //
const verify_token = (req, res) => {
  if (req.query["hub.verify_token"] == process.env.SECRET) {
    logger.debug("Token Verified");
    res.send(req.query["hub.challenge"]);
  } else res.sendStatus(403);
};

const fetch_info_and_post_to_whatsapp = async (req, res) => {
  // console.log(req.body);
  // const num_msg_tuple = WhatsappUtilsObj.extract_number_and_message(req.body);

  // if (num_msg_tuple == null) {
  //   console.log("message or phone number were broken");
  //   logger.error("Broken phone number or link");
  //   // res.sendStatus(200);
  //   return;
  // }
  // let num = num_msg_tuple.num;
  // let msg = num_msg_tuple.msg;

  let { num, msg } = req.num_msg_tuple;

  logger.debug(`Extracted message : ${msg} `);
  logger.debug(`Destination Phone number : ${num}`);
  let movie_info = null;
  let message_body = null;

  let EntityIntent_tuple = null;

  try {
    EntityIntent_tuple = await model.extract_characteristics(msg);

    console.log(EntityIntent_tuple.entities);
    console.log(EntityIntent_tuple.intents);

    logger.debug(`Entitites extraced : \n ${EntityIntent_tuple.entities}`);
    logger.debug(
      `Intent extraced : ${EntityIntent_tuple.intents} with probability: ${EntityIntent_tuple.score}`
    );

    if (EntityIntent_tuple.score < model.SCORE_THRESHOLD) {
      const payload = WhatsappUtilsObj.generate_payload(
        num,
        "I donot understand, please try another message."
      );
      try {
        const success = await WhatsappUtilsObj.send_message_to_whatsapp(
          payload
        );
        logger.debug(`success status: ${success}`);
        res.sendStatus(200);
      } catch (err) {
        logger.error(
          `something went wrong trying to send intent failure message to user ${err.message}`
        );
        res.sendStatus(403);
      }
      return;
    }
  } catch (err) {
    console.error(`entity and intent extraction failed: ${err.message}`);
  }

  if (EntityIntent_tuple != null) {
    try {
      ({ movie_info, message_body } =
        await IMDBObj.get_movie_query_from_intents(EntityIntent_tuple));
    } catch (err) {
      console.error(
        `could not fetch movie information or response message: ${err.message}`
      );
    }
  }

  if (message_body == null) message_body = "oh no, something went wrong";

  const payload = WhatsappUtilsObj.generate_payload(num, message_body);

  const success = await WhatsappUtilsObj.send_message_to_whatsapp(payload);

  /* axios(payload)
    .then((response) => {
      logger.debug("Message sent successfully");
      console.log("Message sent successfully");
    })
    .catch((err) => {
      logger.error("Something went wrong while sending the message");
      console.log("Something went wrong while sending the message");
    }); */

  console.log(`===========BODY===========\n${message_body}`);
  console.log(`success status: ${success}`);

  res.sendStatus(200);
};

module.exports = {
  ping,
  verify_token,
  fetch_info_and_post_to_whatsapp,
  WhatsappUtilsObj,
  IMDBObj,
  model,
};
