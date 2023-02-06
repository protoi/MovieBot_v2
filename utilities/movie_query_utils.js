const {
  generate_body_movie_year,
  generate_body_actor,
  generate_body_genre,
  generate_body_movie,
  generate_body_plot,
} = require("./whatsapp_message_utils");

/**
 *
 * @param {Object} IMDB It is an instance of the send_imdb_query class
 * @param {Object} ans
 * @param {Object} movie_info
 * @param {String} message_body
 * @returns
 */
async function get_movie_query_from_intents(IMDB, ans) {
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
  get_message_and_movie_info: get_movie_query_from_intents,
};
