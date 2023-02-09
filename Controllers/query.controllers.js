const { request, response } = require("express");
const { Logger } = require("winston");
const { logger } = require("../logger");
const { aggregate } = require("../model");
const Query = require("../model");

//This function takes an intent as parameter and gives those documents from mongo DB where the intent matches

const get_document_on_the_basis_of_intents = async (request, response) => {
  let query = null;
  let intent = request.query.intent;
  try {
     query = await Query.find({
      /* "EntityIntent_tuple": {
        "intents": "message.get_actor",
      }, */

      "EntityIntent_tuple.intents": intent,
    });
  } catch (err) {
    logger.error("Could not fetch data");
  }
  //console.log(query);
  try {
    response.send(query);
  } catch (error) {
    response.status(500).send(error);
  }
};

//This Function groups the documents on the basis of intents and gives their respective count

const group_documents_by_intent = async (request, response) => {
  let query = null;
  try {
     query = await Query.aggregate([
      {
        $group: {
          _id: "$EntityIntent_tuple.intents",
          all: {
            $push: "$$ROOT",
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);
  } catch (err) {
    logger.error("Could not fetch data");
  }

  try {
    response.send(query);
  } catch (error) {
    response.status(500).send(error);
  }
};

//This function takes a date in yyyy-mm-dd format
//Then it gets the starting date and ending date of the week in which the input date lies
//Then it groups document on the basis of the dates of the week

const group_queries_by_date_week = async (request, response) => {
  let date = request.query.date;
  let start_date = "2023-02-01";
  let end_date = "2023-02-09";
  let query = null;
  try {
    query = await Query.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              {
                $and: [
                  {
                    $gte: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$Time_Stamp",
                        },
                      },
                      start_date,
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$Time_Stamp",
                        },
                      },
                      end_date,
                    ],
                  },
                ],
              },
              {
                $dateToString: {
                  format: "%d/%m/%Y",
                  date: "$Time_Stamp",
                },
              },
              "other",
            ],
          },
          docs: { $push: "$$ROOT" },
        },
      },
    ]);
  } catch (err) {
    logger.error("Could not fetch data");
  }
  try {
    response.send(query);
  } catch (error) {
    response.status(500).send(error);
  }
};

///This function is not useful for now, ignore it

const get_documents_within_given_time_frame = async (request, response) => {
  let t = request.query.time; // -> 2023-02-08TO03:35:34+00:00

  console.log(t);
  const regex = /(\d{4}-\d{2}-\d{2}T)(\d{2}):\d{2}:\d{2}\.\d{3} (.*)/;

  const x = t.match(regex);

  // console.log(`${x[1]}${x[2]}:00:00.000+${x[3]}`);

  //   let ending_time = request.query.et;

  let start = `2023-02-05T00:00:00.000+00:00`;
  let end = `2023-02-09T00:00:00.+00:00`;

  //   let end = "2023-02-08T05:59:59.999+00:00";

  // let end = "2023-02-08T" + "03" + ":" + "59" + ":" + "59.999" + "+00:00";

  console.log(new Date());
  const query = await Query.find({
    Time_Stamp: {
      $lt: new Date(end),
      $gt: new Date(start),
    },
  });

  try {
    response.send(query);
    //response.send(`between ${start} and ${end} : ${query.length}`);
  } catch (error) {
    response.status(500).send(error);
  }
};

//This function fetches genre array from mongo DB documents
//Then returns a map containing the names of the genres as key and its frequency and value

const get_genre_frequencies = async (request, response) => {
  let query = null;
  try {
     query = await Query.find(
      { "EntityIntent_tuple.entities.genre": { $ne: [] } },
      {
        "EntityIntent_tuple.entities.genre": 1,
        _id: 0,
      }
    );
  } catch (err) {
    logger.error("Could not fetch data");
    response.send(err);
    return;
  }
  let freq_map = new Map();
  query.forEach((element) => {
    let genre = element["EntityIntent_tuple"]["entities"]["genre"];
    genre.forEach((element) => {
      if (freq_map[element] == null) freq_map[element] = 1;
      freq_map[element]++;
    });
  });

  try {
    response.send(freq_map);
  } catch (error) {
    response.status(500).send(error);
  }
};

//Exporting the required functions
module.exports = {
  get_document_on_the_basis_of_intents,
  get_documents_within_given_time_frame,
  group_queries_by_date_week,
  get_genre_frequencies,
  group_documents_by_intent,
};
