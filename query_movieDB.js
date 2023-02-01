// let queries = require('./queries.json')

const axios = require("axios");
require("dotenv").config();

class send_imdb_query {
  constructor() {
    this.actor_mapping = {};
    this.genre_mapping = {};

    this.map_genre_with_ID();
  }

  async map_genre_with_ID() {
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

  async map_actor_with_ID(actor_name) {
    if (this.actor_mapping[actor_name] != null)
      // already mapped
      return;

    try {
      console.log(`mapping ${actor_name}`);
      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/search/person?api_key=${process.env.THE_MOVIE_DB_KEY}&query=${actor_name}`,
        headers: {},
      };
      const actor_ID_response = await axios(config);
      if (actor_ID_response["total_results"] == 0) {
        // map with unidentified
        // actor_mapping[actor_name] = ACTOR_NOT_FOUND;
        return null;
      }
      this.actor_mapping[actor_name] = actor_ID_response.data.results[0]["id"];
      console.log(this.actor_mapping[actor_name]);
      return;
    } catch (err) {
      console.error(err.message);
      console.log(`Failed to identify ${actor_name}`);
      return;
    }
  }

  //{process.env.THE_MOVIE_DB_KEY}
  //Extracting information about movie

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

  async get_actors_from_movie_id(movie_id) {
    var config = {
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

    let actor_IDs = [];
    let genre_IDs = [];

    function modify_string(str) {
      return str.replace(/\s+/g, " ").trim().replace(/ /g, "+");
    }

    // map actor names with their IDs

    let actor_names = search_terms["actor"];
    let normalized_name = "";

    for (let index = 0; index < actor_names.length; index++) {
      const name = actor_names[index];
      try {
        normalized_name = modify_string(name);
        // console.log(`${normalized_name} <-------------`);
        let actor_mapping_output = await this.map_actor_with_ID(
          normalized_name
        );
        // if (actor_mapping_output != ACTOR_NOT_FOUND)
        if (this.actor_mapping[normalized_name] != null)
          actor_IDs.push(this.actor_mapping[normalized_name]);
      } catch (err) {
        console.log(`failed to map ${name} with an ID`);
      }
    }

    // extract IDs of given genre out of mapped genre
    // search_terms["genre"].forEach((genre) => {
    //   console.log(`genre ----> ${genre}`);
    //   if (this.genre_mapping[genre] != null)
    //     genre_IDs.push(this.genre_mapping[genre]);
    // });

    for (let index = 0; index < search_terms["genre"].length; index++) {
      const element = search_terms["genre"][index];
      console.log(`genre ----> ${element}`);

      console.log(`genre ID -----> ${this.genre_mapping[element]}`);
      console.log(this.genre_mapping);
      if (this.genre_mapping[element] != null)
        genre_IDs.push(this.genre_mapping[element]);
    }

    // turning the IDs into strings
    genre_id_string = genre_IDs.join(",");
    actor_id_string = actor_IDs.join(",");

    console.log(`actor_IDs: ${actor_IDs}`);
    console.log(`genre_id_string: ${genre_id_string}`);
    console.log(`actor_id_string: ${actor_id_string}`);
    console.log(`genre mapping ${this.genre_mapping}`, { depth: null });

    // send GET request to discover
    try {
      console.log("test");

      let config = {
        method: "get",
        url: `https://api.themoviedb.org/3/discover/movie?with_genres=${genre_id_string}&with_people=${actor_id_string}&sort_by=vote_average.desc&api_key=${process.env.THE_MOVIE_DB_KEY}`,
        headers: {},
      };

      const imdb_data = (await axios(config)).data.results;

      for (let index = 0; index < imdb_data.length; index++) {
        const element = imdb_data[index];
        movie_names[index] = {
          id: element["id"],
          "original title": element["original_title"],
          overview: element["overview"].substring(0, 50),
        };
      }
    } catch (err) {
      console.error(err.message);
      movie_names = "...";
    }
    // console.table(movie_names);
    const names = movie_names.map((e) => {
      return e["original title"];
    });
    console.log(`movie titles -----> ${names}`);
    return movie_names;

    /* 
            for (const term in search_terms) {
                console.log(`${term}: ${search_terms[term]}`);
        
                let category = term;
                let query = modify_string(search_terms[term]);
        
                try {
                    console.log("test");
                    const imdb_data = await axios(generate_get_payload(category, query));
                    movie_names[category] = imdb_data.data.results;
                }
                catch (err) {
                    console.error(err.message);
                    movie_names[category] = "...";
                }
            }
        */
    // return movie_names;
  }
}
module.exports = { send_imdb_query };
