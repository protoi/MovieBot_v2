// const { send_imdb_query } = require("./query_movieDB");

/**
 * Extracts Mobile number and received message from the user.
 * @param {Object} payload the whatsapp webhook message
 * @returns {[object|null]} if successful it will return an object containing the number and message of the sender otherwise it will return null
 */
function extract_number_and_message(payload) {
  console.log(payload);
  try {
    const number = payload.entry[0].changes[0].value["messages"][0]["from"];
    const message =
      payload.entry[0].changes[0].value["messages"][0]["text"]["body"];

    console.log(`number -> ${number}, message -> ${message}`);
    return { num: number, msg: message };
  } catch (err) {
    return null;
  }
}
/**
 * generates a message to be sent to whatsapp upon the intent message.get_movie_year
 * @param {Object} data object containing the movie name and it's release year
 * @returns {String} reponse string to be sent to whatsapp
 */
function generate_body_movie_year(data) {
  return `${data.movie_name} was released in ${data.release_year}.`;
}

/**
 * generates a message to be sent to whatsapp upon the intent message.get_actor
 * @param {Object} data object containing the movie name and three lists (male, female and other gender) cast members.
 * @returns {String} response string to be sent to whatsapp, the lists will be top 5 cast members in their category
 */
function generate_body_actor(data) {
  let male_list = `Actors: ${data.actors.male.slice(0, 5).join(", ")}`;
  let female_list = `Actress: ${data.actors.female.slice(0, 5).join(", ")}`;
  let other_list = `Others: ${data.actors.others.slice(0, 5).join(", ")}`;

  return `Cast of ${data.movie_name}:\n${male_list}.\n${female_list}.\n${other_list}.`;
}

/**
 * generates a meessage to be sent to whatsapp upon the intent message.get_genre
 * @param {Object} data object containing the movie name and it's list of genres
 * @returns {String}  response string to be sent to whatsapp, it is a comma separated list of genres for that movie
 */
function generate_body_genre(data) {
  return `Genre of ${data.movie_name} is:
${data.genre.join(".\n")}.`;
}

/**
 * generates a message to be sent to whatsapp upon the intent message.get_movie
 * @param {Array} data  Array of objects containing detailed information about the movies
 * @returns {String} response string to be sent to whatsapp, it contains the movie name, it's genres, release date and rating out of 10
 */
function generate_body_movie(data) {
  return data
    .map((movie) => {
      return `*${movie.title}*\n${movie.genre.join(", ")}\nRelease Date: ${
        movie.release
      }\nRating: ${movie.rating}`;
    })
    .join("\n\n");
}

/**
 * generates a message to be sent to whatsapp upon the intent message.get_plot
 * @param {Object} data object containing the title of the movie and it's summary/plot
 * @returns {String} response string to be sent to whatsapp, it contains the full summary of the requested movie
 */
function generate_body_plot(data) {
  return `${data.title}:\n${data.plot}`;
}

/**
 * returns an Object which is to be used by axios to send a message to the whatsapp API directed towards the user
 * @param {integer} number mobile number of the query sender
 * @param {String} message_body raw message to be sent to the user
 * @returns {Object}  Object to be sent to the whatsapp API as a HTTP POST request
 */
function generate_payload(number, message_body) {
  let reply_body = JSON.stringify({
    messaging_product: "whatsapp",
    to: number,
    type: "text",
    text: {
      body: message_body,
    },
  });

  const config = {
    method: "post",
    url: "https://graph.facebook.com/v15.0/105933825735159/messages",
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`,
      "Content-Type": "application/json",
    },
    data: reply_body,
  };
  return config;
}

/**
 *
 * @param {Object} IMDB It is an instance of the send_imdb_query class
 * @param {Object} ans
 * @param {Object} movie_info
 * @param {String} message_body
 * @returns
 */
async function get_message_and_movie_info(IMDB, ans) {
  let movie_info = null,
    message_body = null;
  switch (ans.intents) {
    case "message.get_movie":
      /*
        gets an object like {
            Map(actorName,actorID),
            Map(genreName,genreID),
            actorIdString,
            genreIdString}
    */
      // logger.debug("Intent - getting movies from quey");
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

      message_body = generate_body_movie(top3_movie_list);
      // log the message_body here
      break;

    default:
      let movie_name = ans.entities.moviename[0];
      if (movie_name == null) {
        console.log("Movie name not detected, possibly due to lack of quotes");
        //also send the user that they need to specify a movie in double/single quotes
        message_body =
          "Please enclose the name of the movie in double/single quotes";
        break;
      }
      // removes anything except digits, alphabets and spaces
      movie_name = movie_name.replace(/[^\w ]/gm, "");

      movie_info = await IMDB.find_movie_info(movie_name);
      if (movie_info == null) {
        console.log(`movie named ${movie_name} not found`);
        // log this
        message_body = `movie named ${movie_name} not found`;
        break;
      }
      switch (ans.intents) {
        case "message.get_genre":
          message_body = generate_body_genre({
            movie_name: movie_info.original_title,
            genre: await IMDB.get_genre_from_IDs(movie_info.genre_ids),
          });
          // logger.debug("Intent - getting genre from query");
          break;
        case "message.get_actor":
          message_body = generate_body_actor({
            movie_name: movie_info.original_title,
            actors: await IMDB.get_cast_from_movie_id(movie_info.id),
          });
          // logger.debug("Intent - getting actor list from query");
          break;
        case "message.get_movie_year":
          message_body = generate_body_movie_year({
            movie_name: movie_info.original_title,
            release_year: movie_info.release_date,
          });
          // logger.debug("Intent - getting release year from query");
          break;
        case "message.get_plot":
          message_body = generate_body_plot({
            title: movie_info.original_title,
            plot: movie_info.overview,
          });
          // logger.debug("Intent - getting plot from query");
          break;

        default:
          message_body = "failed to detect intent";
          // logger.error("Failed to detect intent ");
          break;
      }
      break;
  }
  return { movie_info, message_body };
}

module.exports = {
  extract_number_and_message,
  generate_body_movie_year,
  generate_body_actor,
  generate_body_genre,
  generate_body_movie,
  generate_body_plot,
  generate_payload,
  get_message_and_movie_info,
};
