const express = require("express");
const axios = require("axios");
const movieDB = require("./query_movieDB");
const nlp_model = require("./retain_model");
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
    res.send(req.query["hub.challenge"]);
  else res.sendStatus(403);
});

exp.post("/movie", async (req, res) => {
  const num_msg_tuple = extract_number_and_message(req.body);

  if (num_msg_tuple == null) {
    console.log("message or phone number were broken");
    // res.sendStatus(200);
    return;
  }
  let num = num_msg_tuple.num;
  let msg = num_msg_tuple.msg;

  let movie_info = null;
  const ans = await model.extract_characteristics(msg);
  let message_body = null;

  console.log(ans.entities);
  console.log(ans.intents);
  


  switch (ans.intents) {
    case "message.get_movie":
      /*
        gets an object like {
            Map(actorName,actorID), 
            Map(genreName,genreID), 
            actorIdString, 
            genreIdString}
    */
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
      const movie_name = ans.entities.moviename[0];
      if (movie_name == null) {
        console.log("please specify a movie");
        //also send the user that they need to specify a movie in double/single quotes
        break;
      }
      movie_info = await IMDB.find_movie_info(movie_name);
      if (movie_info == null) {
        console.log(`movie named ${movie_name} not found`);
        // also send this to the user
        break;
      }
      switch (ans.intents) {
        case "message.get_genre":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            genre: await IMDB.get_genre_from_IDs(movie_info.genre_ids),
          });
          break;
        case "message.get_actor":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            actors: await IMDB.get_cast_from_movie_id(movie_info.id),
          });
          break;
        case "message.get_movie_year":
          message_body = generate_body(ans.intents, {
            movie_name: movie_info.original_title,
            release_year: movie_info.release_date,
          });
          break;
        case "message.get_plot":
          message_body = generate_body(ans.intents, {
            title: movie_info.original_title,
            plot: movie_info.overview,
          });
          break;

        default:
          message_body = "failed to detect intent";
          break;
      }
      break;
  }

  console.log(`BODY -------> ${message_body}`);

  res.send(message_body);

//   res.sendStatus(200);
});

exp.listen(PORT, () => {
  console.log(`express app listening to port #${PORT}`);
  console.log("hello world");
});
