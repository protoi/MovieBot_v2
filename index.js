const retain_model = require("./retain_model");
const model = new retain_model.natural_language_processing_model();
const movie_lookup = require("./query_movieDB");
const movieDB = new movie_lookup.send_imdb_query();

model.load_model();

function extract_movie_name(msg) {
  let message_matcher = /\"(.*)\"/;

  const matched = msg.match(message_matcher);
  if (matched != null && matched.length > 1) {
    movie_name = matched[1];

    return movie_name;
  }
  return null;
}

(async () => {
  const queries = [
    'Who was the actor in "Rise of the planet of the apes"',
    'What genre is "RIse of the planet of the apes"',
    'is "rise of the planet of the apes" a comedy movie',
    'who were the actors in "Spiderman"',
    'name of the girl in "Avengers age of ultron"',
    'what was the genre of "Titanic"',
    "show me action and horror movies of tom hanks and johnny depp",
    "when did titanic come out",
    'which year did "rise of the planet of the apes" get released',
    'which year did "avengers age of ultron" get released',
    "release date of action and horror movie starring tom hanks",
    "action movies of tom hanks in 1992",
    "comedy movies from 2010",
    'Tell me to release date of "The dark knight"',
    'Tell me to release date of "rise of the planet of the apes"',
    'tell me the name of the girl in "The dark knight"',
  ];

  queries.forEach(async (q) => {
    const ans = await model.extract_characteristics(q);
    console.log("query---> " + q + "  intent ----> ", ans.intents);
    // console.log(ans.entities);
    // console.log("---intent---");
    // console.log(ans.intent);
    // console.log("---entities---");
    // console.log(ans.entities);
    // console.log(ans);

    let movie_name;
    if (ans.intents != "message.get_movie") {
      const movie_name = extract_movie_name(q);
      if (movie_name != null) {
        const movie_info = await movieDB.find_movie_info(movie_name);
        if (ans.intents == "message.get_genre") {
          console.log(movie_info.genre_ids);
        } else if (ans.intents == "message.get_actor") {
          console.log(`movie ID -----> ${movie_info.id}`);
          // lookup the movie using movie ID
          const cast = await movieDB.get_actors_from_movie_id(movie_info.id);
          if (cast != null)
            // console.log(cast.male[0]);
            console.log(
              `cast member ----->${cast.male[0]}, ${cast.female[0]}, ${cast.others}`
            );
        } else if (ans.intents == "message.get_movie_year") {
          console.log(`movie release year -----> ${movie_info.release_date}`);
        }
        console.log(`title was ----> ${movie_info.original_title}`);
      }
    }
  });
})();
