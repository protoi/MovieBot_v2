const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  Destination_Phone_number: {
    type: String,
    required: true,
  },
  Query_Message: {
    type: String,
    default: 0,
  },
  EntityIntent_tuple: {
    type: Object,
    required: false,
  },
  Response_Body: {
    type: String,
    default: null,
  },
  Time_Stamp: {
    type: Date,
    required: false,
  },
  Entity_valuelist: {
    type: Array,
    default: null,
  },
});

const Query = mongoose.model("Query", QuerySchema);

module.exports = Query;
