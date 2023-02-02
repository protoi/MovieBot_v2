const retain_model = require("./retain_model");
const model = new retain_model.natural_language_processing_model();
const movie_lookup = require("./query_movieDB");
const movieDB = new movie_lookup.send_imdb_query();
const IMDB = new movie_lookup.send_imdb_query();
const {
  extract_number_and_message,
  generate_body,
  generate_payload,
} = require("./utilities");
const e = require("express");

model.load_model();

(async () => {
  await IMDB.genre_ID_pre_mapping();

  const queries = [
    // "show me thriller movies having brad pit and george clooney",
    "what is the plot of '300'?",
    // 'Who was the actor in "Rise of the planet of the apes"',
    // 'What genre is "RIse of the planet of the apes"',
    // 'is "rise of the planet of the apes" a comedy movie',
    // 'who were the actors in "Spiderman"',
    // 'name of the girl in "Avengers age of ultron"',
    // 'what was the genre of "Titanic"',
    // "show me action and horror movies of tom hanks and johnny depp",
    // "when did titanic come out",
    // 'which year did "rise of the planet of the apes" get released',
    // 'which year did "avengers age of ultron" get released',
    // "release date of action and horror movie starring tom hanks",
    // "action movies of tom hanks in 1992",
    // "comedy movies from 2010",
    // 'Tell me to release date of "The dark knight"',
    // 'Tell me to release date of "rise of the planet of the apes"',
    // 'tell me the name of the girl in "The dark knight"',
  ];

  queries.forEach(async (q) => {
    const ans = await model.extract_characteristics(q);

    // console.log(ans.entities);
    // console.log("query---> " + q + "  intent ----> ", ans.intents);
    // console.log(ans.entities);
    // console.log("---intent---");
    // console.log(ans.intent);
    // console.log("---entities---");
    // console.log(ans.entities);
    // console.log(ans);

    let movie_name;
    if (ans.intents != "message.get_movie") {
      // const movie_name = extract_movie_name(q);

      const movie_name = ans.entities.moviename[0];

      const movie_info = await movieDB.find_movie_info(movie_name);
      if (movie_name != null) {
        if (movie_info != null) {
          if (ans.intents == "message.get_genre") {
            console.log(movie_info.genre_ids);
            console.log(await IMDB.get_genre_from_IDs(movie_info.genre_ids));
          } else if (ans.intents == "message.get_actor") {
            console.log(`movie ID -----> ${movie_info.id}`);
            // lookup the movie using movie ID
            const cast = await movieDB.get_cast_from_movie_id(movie_info.id);
            if (cast != null)
              // console.log(cast.male[0]);
              console.log(
                `cast member ----->${cast.female[0]}, ${cast.male[0]}`
              );
          } else if (ans.intents == "message.get_movie_year") {
            console.log(`movie release year -----> ${movie_info.release_date}`);
          } else if (ans.intents == "message.get_plot") {
            const data = generate_body(ans.intents, {
              title: movie_info.original_title,
              plot: movie_info.overview,
            });
            console.log(data);
          }
          console.log(`title was ----> ${movie_info.original_title}`);
        } else {
          console.error("movie_info was null");
        }
      }
    } else {
      // console.log(ans.entities);
      const movie_queries = await IMDB.find_queries(ans.entities);
      // console.dir(movie_queries, { depth: null });
      const movie_info = await IMDB.GET_movie_names_using_genre_and_actor(
        movie_queries
      );
      // console.dir(movie_info, { depth: null });

      const movie_list = [];

      for (let index = 0; index < Math.min(3, movie_info.length); index++) {
        const movie = movie_info[index];
        const movie_details = {
          title: movie.original_title,
          poster: movie.backdrop_path,
          movie_id: movie.id,
          plot: movie.overview,
          genre: await IMDB.get_genre_from_IDs(movie.genre_ids),
          release: movie.release_date,
          rating: movie.vote_average,
        };

        movie_list.push(movie_details);
      }

      const data = generate_body(ans.intents, movie_list);
      console.log(data);
      // console.dir(movie_list);
    }



    
  });
})();
