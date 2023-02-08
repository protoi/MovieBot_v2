const express = require("express");
const query_router = express.Router();
const query_controllers = require("../Controllers/query.controllers");

//query_router.post("/query", query_controllers.get_document_on_the_basis_of_intents);
//query_router.post("/query", query_controllers.group_documents_by_intent);
query_router.get("/query",query_controllers.get_documents_within_given_time_frame)

module.exports = { query_router };
