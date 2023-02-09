const express = require("express");
const query_router = express.Router();
const query_controllers = require("../Controllers/query.controllers");

query_router.get(
  "/query/get_documents_by_intents",
  query_controllers.get_document_on_the_basis_of_intents
);
query_router.get(
  "/query/group_documents_by_intents",
  query_controllers.group_documents_by_intent
);
//query_router.get("/query",query_controllers.get_documents_within_given_time_frame)
query_router.get(
  "/query/group_queries_by_date_week",
  query_controllers.group_queries_by_date_week
);
query_router.get(
  "/query/get_genre_frequencies",
  query_controllers.get_genre_frequencies
);

module.exports = { query_router };
