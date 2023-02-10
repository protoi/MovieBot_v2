const { logger } = require("../logger");

const {
  WhatsappUtilsObj,
  IMDBObj,
  model,
} = require("../Controllers/movie.controllers");

const validate_dependencies = async (req, res, next) => {
  console.log("entered middleware");
  console.log("===============");
  console.log(JSON.stringify(req, null, 2));
  console.log("===============");

  console.log(req.body);
  const num_msg_tuple = WhatsappUtilsObj.extract_number_and_message(req.body);

  //number or message failed to extract
  if (num_msg_tuple == null) {
    console.log("message or phone number were broken");
    logger.error("Broken phone number or link");
    res.sendStatus(200);
    return;
  }
  req.num_msg_tuple = num_msg_tuple;

  //if model hasn't finished loading or genre mapping is not done
  if (!model.model_finished_loading || !IMDBObj.genre_mapper_initialized) {
    logger.error("NLP model and mapping have not finished loading yet");
    const payload = WhatsappUtilsObj.generate_payload(
      num_msg_tuple.num,
      "Work in progress"
    );
    const success = await WhatsappUtilsObj.send_message_to_whatsapp(payload);
    logger.debug("message successfully sent");
    res.sendStatus(200);
    return;
  }
  // if all these conditions checked out then we can proceed to the next steps
  next();
};
module.exports = { validate_dependencies };
