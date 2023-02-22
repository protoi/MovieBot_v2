/**
 * @module /query/
 */

const express = require("express");
const query_router = express.Router();
const query_controllers = require("../Controllers/query.controllers");

/**
 * <b>Functionality</b>: Returns the queries of the supplied intent as an array
 *
 * <b>Type</b>: GET
 * <table>
 * <tr>
 *   <th>Params</th>
 *   <th>Optional</th>
 *   <th>Options</th>
 * </tr>
 * <tr>
 *   <td>intent</td>
 *   <td>No</td>
 *    <td>
 *      <ul style="list-style-type:none;">
 *        <li>message.get_actor</li>
 *        <li>message.get_movie</li>
 *        <li>message.get_plot</li>
 *        <li>message.get_genre</li>
 *        <li>message.greetings</li>
 *        <li>message.get_release_year</li>
 *      </ul>
 *    </td>
 * </tr>
 * </table>
 *
 * <b>Example: </b> /query/get_documents_by_intents?intent=message.get_movie
 * @name /query/get_documents_by_intents
 */
query_router.get(
  "/query/get_documents_by_intents",
  query_controllers.get_document_on_the_basis_of_intents
);

/**
 * <b>Functionality</b>: Returns an intent frequency mapping as an array of objects of the structure {_id: Intent, count: number } with count more than 0
 *
 * <b>Type</b>: GET
 *
 * <b>Example: </b> /query/get_documents_by_intents?intent=message.get_movie
 * @name /query/group_documents_by_intents
 */
query_router.get(
  "/query/group_documents_by_intents",
  query_controllers.group_documents_by_intent
);

/**
 * <b>Functionality</b>: Returns an array of objects containing queries submitted, grouped by the weeks day (monday, tuesday... etc) and hour
 *
 * <b>Type</b>: GET
 * <table>
 * <tr>
 *   <th>Params</th>
 *   <th>Optional</th>
 *   <th>Format</th>
 * </tr>
 * <tr>
 *   <td>date</td>
 *   <td>No</td>
 *    <td>yyyy/mm/dd</td>
 * </tr>
 * </table>
 *
 * <b>Example: </b> /query/group_queries_by_date_week?date=2022/02/17
 * @name /query/group_queries_by_date_week
 */

query_router.get(
  "/query/group_queries_by_date_week",
  query_controllers.group_queries_by_date_week
);

/**
 * <b>Functionality</b>: Returns a genre - frequency mapping as an array of objects of the structure { genre : count } with count more than 0
 *
 * <b>Type</b>: GET
 *
 * <b>Example: </b> /query/get_genre_frequencies
 * @name /query/get_genre_frequencies
 */
query_router.get(
  "/query/get_genre_frequencies",
  query_controllers.get_genre_frequencies
);

/**
 * <b>Functionality</b>: Returns an actor - frequency mapping as an array of objects of the structure {actor_name : count } with count more than 0
 *
 * <b>Type</b>: GET
 *
 * <b>Example: </b> /query/get_actor_frequencies
 * @name /query/get_actor_frequencies
 */
query_router.get(
  "/query/get_actor_frequencies",
  query_controllers.get_actor_frequencies
);

/**
 * <b>Functionality</b>: Returns a movie - frequency mapping as an array of objects of the structure {movie name: count } with count more than 0
 *
 * <b>Type</b>: GET
 *
 * <b>Example: </b> /query/get_movie_frequencies
 * @name /query/get_movie_frequencies
 */
query_router.get(
  "/query/get_movie_frequencies",
  query_controllers.get_movie_frequencies
);

module.exports = { query_router };
