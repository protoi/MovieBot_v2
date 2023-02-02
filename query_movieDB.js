const axios = require("axios");
require("dotenv").config();

class send_imdb_query {
  constructor() {
    this.actor_mapping = {};
    this.genre_mapping = {};

    this.genre_ID_pre_mapping();
  }

  /**
   *  Maps genres with their IDs and vice versa for quick look-up
   */
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
      // return true;
    } catch (err) {
      console.error(`Failed to map genres: ${err.message}`);
      // return null;
    }
  }

  /**
   * Function to map an actor with their corresponding IMDB ID. The actor will be mapped with null if their ID is not found
   * @param {array} actor_names an array of strings, which are the cast names
   * @returns {Map} mapping of actor name with ID
   */
  async map_actors_with_ID(actor_names) {
    const actor_mappings = new Map();

    for (let index = 0; index < actor_names.length; index++) {
      const actor_name = actor_names[index];

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
            `mapping actor = ${actor_name} with ID = ${actor_response.data.results[0]["id"]}`
          );
        } else actor_mappings.set(actor_name, null);
      } catch (err) {
        console.error(`failed to map ${actor_name} ----> ${err.message}`);
      }
    }
    return actor_mappings;
  }

  /**
   * Maps the string genre list to it's corresponding IMDB ID. The ID can be null if genre cannot be mapped
   * @param {array} genre_names an array of strings which are genres
   * @returns {Map} mapping between genre and it's unique ID
   */
  map_genres_with_ID(genre_names) {
    const genre_mapping = new Map();

    genre_names.forEach((genre) => {
      if (this.genre_mapping[genre] != null)
        genre_mapping.set(genre, this.genre_mapping[genre]);
      else genre_mapping.set(genre, null);
    });
    return genre_mapping;
  }

  /**
   * returns an array of strings which is the genre strings associated with the genre IDs
   * @param {array} genre_IDs Array of integers, can contain null values.
   * @returns {array} an array of strings corresponding to an ID's genre name.
   */
  get_genre_from_IDs(genre_IDs) {
    return genre_IDs
      .map((id) => {
        console.log(this.genre_mapping[id]);
        return this.genre_mapping[id] || null;
      })
      .filter((element) => {
        return element != null;
      });
  }

  /**
   * Look up movie by it's name
   * @param {string} movie_name name of the movie to be looked up
   * @returns {[object|null]} detailed information about the movie being looked up, can be null if such a movie is not found
   */
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
      console.error(`${err.message}`);
      return null;
    }
  }

  /**
   *  male, female and other gender cast members from a movie ID
   * @param {integer} movie_id unique ID IMDB for a given movie
   * @returns {Object} returns an object containing three arrays of strings, male, female and other gender cast members, will return null if no such movie is found
   */
  async get_cast_from_movie_id(movie_id) {
    let config = {
      method: "get",
      url: `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${process.env.THE_MOVIE_DB_KEY}&language=en-US`,
      headers: {},
    };
    try {
      let cast_response = await axios(config);
      // console.log(cast_response.data.id);
      let cast = { male: [], female: [], others: [] };
      cast_response.data.cast.forEach((element) => {
        if (element.gender == 1) cast.female.push(element.original_name);
        else if (element.gender == 2) cast.male.push(element.original_name);
        else cast.others.push(element.original_name);
      });
      return cast;
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  /**
   *  queries the IMDB API for IDs of the actors and genres
   * @param {object} search_terms object containing actor list, genre list, date and movie name, all of these can be null values
   * @returns {object} returns an object with Maps of actor/genre and their IDs, stringified actor/genre IDs and the year mentioned
   */
  async find_queries(search_terms) {
    /**
     * Turns the actor id or genre id mapping into a string of comma separated IDs
     * @param {Map} entity_map a Mapping of either (actor, actorID) or (genre, genreID)
     * @returns {array} stringified comma separated actorIDs or genreIDs, excludes the null values
     */
    function join_and_stringify_IDs(entity_map) {
      // console.log("stringifying now");
      return Array.from(entity_map.values())
        .filter((element) => {
          return element != null;
        })
        .join(",");
    }

    let actor_id_string = "";
    let genre_id_string = "";
    let actor_IDs = null;
    let genre_IDs = null;
    let year = null;

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
      //turning the ID map into a comma separated string
      actor_IDs = await this.map_actors_with_ID(actor_names);
      if (actor_IDs != null) {
        actor_id_string = join_and_stringify_IDs(actor_IDs);
      }
      // console.log(`actor_IDs ----->  ${actor_IDs}`);
      // console.log(`genre_id_string ----->  ${genre_id_string}`);
      // console.log(`actor_id_string ----->  ${actor_id_string}`);
    } catch (err) {
      console.error(err.message);
    }
    console.log(search_terms["daterange"]);
    return {
      actor_ID_mapping: actor_IDs,
      genre_ID_mapping: genre_IDs,
      actor_string: actor_id_string,
      genre_string: genre_id_string,
      year: search_terms["daterange"][0],
    };
  }

  /**
   * sends a GET request to the IMDB API /discover/
   * @param {object} entities object containing Maps of actor/genre and their IDs, stringified actor/genre IDs and a year
   * @returns {array} array of objects containing detailed movie informations
   */
  async GET_movie_names_using_genre_and_actor(entities) {
    // console.log(entities);
    // send GET request to discover
    let imdb_data = null;
    try {
      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/discover/movie?primary_release_year=${entities.year}&with_genres=${entities.genre_string}&with_people=${entities.actor_string}&sort_by=popularity.desc&api_key=${process.env.THE_MOVIE_DB_KEY}`,
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
