const axios = require("axios");
require("dotenv").config();

class send_imdb_query {
  constructor() {
    this.actor_mapping = {};
    this.genre_mapping = {};

    this.genre_ID_pre_mapping();
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
      //   console.log(this.genre_mapping);
      return true;
    } catch (err) {
      console.log(`Failed to map genres`);
      return null;
    }
  }

  // map a list of actor names with their corresponding IDs
  // input = list of strings, output = hashmap key = string, value =
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

        if (actor_response["total_results"] >= 1)
          actor_mappings.set(actor_name, actor_response.data.results[0]["id"]);
        else actor_mappings.set(actor_name, null);
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
    let movie_names = [];
    let err_flag = false;
    let actor_id_string = "";
    let genre_id_string = "";

    let actor_IDs = {};
    let genre_IDs = {};

    // map actor names with their IDs

    let actor_names = search_terms["actor"];
    let genre_names = search_terms["genre"];

    let normalized_name = "";

    //mapped actors with their corresponding IDs
    try {
      actor_IDs = await this.map_actors_with_ID(actor_names);
      //mapped genres with their corresponding IDs
      genre_IDs = this.map_genres_with_ID(genre_names);

      /*
    genre_IDs = {"horror": 10, "comedy": 20, "sjkasa": null}
    new_str = "10,20"
    */

      // turning the IDs into strings

      actor_IDs.forEach((value, key) => {
        if (value != null) actor_id_string += `,${value}`;
      });
      actor_id_string = actor_id_string.substring(1);

      genre_IDs.forEach((value, key) => {
        if (value != null) genre_id_string += `,${value}`;
      });
      genre_id_string = genre_id_string.substring(1);

      console.log(`actor_IDs: ${actor_IDs}`);
      console.log(`genre_id_string: ${genre_id_string}`);
      console.log(`actor_id_string: ${actor_id_string}`);
      console.log(`genre mapping ${this.genre_mapping}`, { depth: null });
    } catch (err) {
      console.error(err.message);
    }
    const extracted_information = {
      actor_ID_mapping: actor_IDs,
      genre_ID_mapping: genre_IDs,
      actor_string: actor_id_string,
      genre_string: genre_id_string,
    };
    return extracted_information;
  }

  async GET_movie_names_using_entities(entities) {
    // send GET request to discover
    let imdb_data = null;
    try {
      console.log("test");

      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/discover/movie?with_genres=${entities.genre_id_string}&with_people=${entities.actor_id_string}&sort_by=vote_average.desc&api_key=${process.env.THE_MOVIE_DB_KEY}`,
        headers: {},
      };

      imdb_data = (await axios(config)).data.results;

      return imdb_data;
    } catch (err) {
      console.error(err.message);
      movie_names = "...";
    }
    // console.table(movie_names);
    return imdb_data;
  }
}
module.exports = { send_imdb_query };
