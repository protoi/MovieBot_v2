const express = require("express");
const axios = require("axios");
const movieDB = require("./query_movieDB");
const nlp_model = require("./retain_model");
const {logger} = require("./logger");
const {
  extract_number_and_message,
  generate_payload,
  generate_body,
} = require("./utilities");
require("dotenv").config();

const PORT = 9999;

const IMDB = new movieDB.send_imdb_query();
const model = new nlp_model.natural_language_processing_model();
model.load_model();

const exp = express();
exp.use(express.json());
exp.use(express.urlencoded({ extended: true }));

exp.get("/", (req, res) => {
  res.send("Hello world!");
});

exp.get("/movie", (req, res) => {
  if (req.query["hub.verify_token"] == process.env.SECRET)
  {
    logger.debug("Webhook Verification");
    res.send(req.query["hub.challenge"]);
    
  }
  else {
    logger.error("Permission Denied")
    res.sendStatus(403);
  } 
});

exp.post("/movie", async (req, res) => {
  console.log(req.body);
  const num_msg_tuple = extract_number_and_message(req.body);

  if (num_msg_tuple == null) {
    console.log("message or phone number were broken");
    logger.error("Broken phone number or link")
    // res.sendStatus(200);
    return;
  }
  let num = num_msg_tuple.num;
  let msg = num_msg_tuple.msg;

  let movie_info = null;
  const ans = await model.extract_characteristics(msg);
  logger.debug(`Extracted message : ${msg} `);
  logger.debug(`Destination Phone number : ${num}`);
  let message_body = null;

  console.log(ans.entities);
  console.log(ans.intents);

  logger.debug(`Entitites extraced : \n ${ans.entities}`);
  logger.debug(`Intent extraced : \n ${ans.intents}`);

  switch (ans.intents) {
    case "message.get_movie":
      /*
        gets an object like {
            Map(actorName,actorID), 
            Map(genreName,genreID), 
            actorIdString, 
            genreIdString}
    */
      logger.debug("Intent - getting movies from quey");
      const movie_queries = await IMDB.find_queries(ans.entities);

      movie_info = await IMDB.GET_movie_names_using_genre_and_actor(
        movie_queries
      );

      const top3_movie_list = [];

      for (let index = 0; index < Math.min(3, movie_info.length); index += 1) {
        const movie = movie_info[index];
        top3_movie_list.push({
          title: movie.original_title,
          poster: movie.backdrop_path,
          genre: await IMDB.get_genre_from_IDs(movie.genre_ids),
          release: movie.release_date,
          rating: movie.vote_average,
        });
      }

      message_body = generate_body(ans.intents, top3_movie_list);
      // log the message_body here
      break;

    default:
      let movie_name = ans.entities.moviename[0];
      console.log(`movie name before replacing ---> ${movie_name}`);
      if (movie_name == null) {
        console.log("Movie name not detected, possibly due to lack of quotes");
        //also send the user that they need to specify a movie in double/single quotes
        message_body =
          "Please enclose the name of the movie in double/single quotes";
        break;
      }
      // removes anything except digits, alphabets and spaces
      movie_name = movie_name.replace(/[^\w ]/gm, "");
      console.log(`movie name after replacing ---> ${movie_name}`);

      movie_info = await IMDB.find_movie_info(movie_name);
      if (movie_info == null) {
        console.log(`movie named ${movie_name} not found`);
        // also send this to the user
        message_body = `movie named ${movie_name} not found`;
        break;
      }
      switch (ans.intents) {
        case "message.get_genre":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            genre: await IMDB.get_genre_from_IDs(movie_info.genre_ids),
          });
          logger.debug("Intent - getting genre from query");
          break;
        case "message.get_actor":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            actors: await IMDB.get_cast_from_movie_id(movie_info.id),
          });
          logger.debug("Intent - getting actor list from query");
          break;
        case "message.get_movie_year":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            release_year: movie_info.release_date,
          });
          logger.debug("Intent - getting release year from query");
          break;
        case "message.get_plot":
          message_body = generate_body(ans.intents, {
            title: movie_info.original_title,
            plot: movie_info.overview,
          });
          logger.debug("Intent - getting plot from query");
          break;

        default:
          message_body = "failed to detect intent";
          logger.error("Failed to detect intent ");
          break;
      }
      break;
  }

  const payload = generate_payload(num, message_body);

  axios(payload)
    .then((response) => {
      logger.debug("Message sent successfully");
      console.log("Message sent successfully");
    })
    .catch((err) => {
      logger.error("Something went wrong while sending the message");
      console.log("Something went wrong while sending the message");
    });

  console.log(`BODY -------> ${message_body}`);

//   res.send(message_body);

  res.sendStatus(200);
});

exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});
