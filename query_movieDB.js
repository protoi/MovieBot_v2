const axios = require("axios");
require("dotenv").config();

class send_imdb_query {
  constructor() {
    this.actor_mapping = {};
    this.genre_mapping = {};

    // this.genre_ID_pre_mapping();
  }

  async genre_ID_pre_mapping() {
    try {
      // console.log(`mapping ${genre_name}`);
      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.THE_MOVIE_DB_KEY}`,
        headers: {},
      };
      const genre_ID_response = await axios(config);

      genre_ID_response.data["genres"].forEach((element) => {
        this.genre_mapping[element["name"].toLowerCase()] = element["id"];
        this.genre_mapping[element["id"]] = element["name"].toLowerCase();
      });
      // console.log(this.genre_mapping);
      return true;
    } catch (err) {
      console.log(`Failed to map genres`);
      return null;
    }
  }

  // map a list of actor names with their corresponding IDs
  // input = list of strings, output = hashmap key = string, value = id
  async map_actors_with_ID(actor_names) {
    const actor_mappings = new Map();

    // first loop over the actor names
    actor_names.forEach(async (actor_name) => {
      try {
        let config = {
          method: "get",
          url: `https://api.themoviedb.org/3/search/person?api_key=${process.env.THE_MOVIE_DB_KEY}&query=${actor_name}`,
          headers: {},
        };

        const actor_response = await axios(config);

        if (actor_response.data.results.length != 0) {
          actor_mappings.set(actor_name, actor_response.data.results[0]["id"]);
          console.log(
            `mapping ${actor_name} with ${actor_response.data.results[0]["id"]}`
          );
        } else actor_mappings.set(actor_name, null);
      } catch (err) {
        console.error(`failed to map ${actor_name} ----> ${err.message}`);
      }
    });
    return actor_mappings;
  }

  map_genres_with_ID(genre_names) {
    const genre_mapping = new Map();

    genre_names.forEach((genre) => {
      if (this.genre_mapping[genre] != null)
        genre_mapping.set(genre, this.genre_mapping[genre]);
      else genre_mapping.set(genre, null);
    });
    return genre_mapping;
  }

  get_genre_from_IDs(genre_IDs) {
    return genre_IDs
      .map((id) => {
        return this.genre_mapping[id] || null;
      })
      .filter((element) => {
        return element != null;
      });
  }

  // find information about the movie
  async find_movie_info(movie_name) {
    let config = {
      method: "get",
      url: `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_KEY}&language=en-US&query=${movie_name}&page=1&include_adult=false`,
      headers: {},
    };
    try {
      let tmdb_response = await axios(config);
      if (
        tmdb_response.data.total_results == 0 ||
        tmdb_response.data.total_results == null
      ) {
        return null;
      }
      return tmdb_response.data.results[0];
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  //Extract actor names from movie id
  async get_cast_from_movie_id(movie_id) {
    let config = {
      method: "get",
      url: `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${process.env.THE_MOVIE_DB_KEY}&language=en-US`,
      headers: {},
    };
    try {
      let cast_response = await axios(config);
      console.log(cast_response.data.id);
      let cast = { male: [], female: [], others: [] };
      cast_response.data.cast.forEach((element) => {
        if (element.gender == 1) cast.female.push(element.original_name);
        else if (element.gender == 2) cast.male.push(element.original_name);
        else cast.others.push(element.original_name);
        // console.log(":)");
      });
      //   console.log("here----> "+ cast);
      return cast;
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  async find_queries(search_terms) {
    function join_and_stringify_IDs(entity_map) {
      console.log("stringifying now");
      const temp = Array.from(entity_map.values())
        .filter((element) => {
          return element != null;
        })
        .join(",");
      console.log(`temp ---> ${temp}`);
      return temp;
    }

    let actor_id_string = "";
    let genre_id_string = "";
    let actor_IDs = null;
    let genre_IDs = null;

    let actor_names = search_terms["actor"];
    console.log(`actor -------> ${actor_names}`);
    let genre_names = search_terms["genre"];
    console.log(`genre -------> ${genre_names}`);

    try {
      //generating the genre mappings and forming a comma separated string
      genre_IDs = await this.map_genres_with_ID(genre_names);
      if (genre_IDs != null)
        genre_id_string = join_and_stringify_IDs(genre_IDs); // {"a":1, "b":2, "c":null, "d":4} ---> "1,2,4"

      //mapped actors with their corresponding IDs
      //turning the ID map into a comma separated string strings
      actor_IDs = await this.map_actors_with_ID(actor_names);
      console.log(actor_IDs);

      if (actor_IDs != null) {
        actor_id_string = join_and_stringify_IDs(actor_IDs);
      }
      console.log(`actor_IDs ----->  ${actor_IDs}`);
      console.log(`genre_id_string ----->  ${genre_id_string}`);
      console.log(`actor_id_string ----->  ${actor_id_string}`);
    } catch (err) {
      console.error(err.message);
    }
    return {
      actor_ID_mapping: actor_IDs,
      genre_ID_mapping: genre_IDs,
      actor_string: actor_id_string,
      genre_string: genre_id_string,
    };
  }

  async GET_movie_names_using_genre_and_actor(entities) {
    // send GET request to discover
    let imdb_data = null;
    try {
      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/discover/movie?with_genres=${entities.genre_id_string}&with_people=${entities.actor_id_string}&sort_by=vote_average.desc&api_key=${process.env.THE_MOVIE_DB_KEY}`,
        headers: {},
      };

      imdb_data = (await axios(config)).data.results;

      return imdb_data;
    } catch (err) {
      console.error(err.message);
    }
    // console.table(movie_names);
    return imdb_data;
  }
}
module.exports = { send_imdb_query };
