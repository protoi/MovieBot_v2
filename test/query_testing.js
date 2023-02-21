var expect = require("chai").expect;
var request = require("request");
const assert = require("assert");
const { response } = require("express");

describe("/query/group_documents_by_intents api test", () => {
  it("checking fields of response", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/group_documents_by_intents",
      (error, response, body) => {
        try {
          expect(response.statusCode == 200);
          let parsedBody = JSON.parse(body);
          expect(parsedBody).to.be.a("array");
          parsedBody.forEach((element) => {
            //Check whether response from mongodb contains the fields _id and count
            //Then respectively checking whether they have the correct
            expect(element).to.have.property("count");
            assert(typeof element.count === "number" && element.count >= 0);
            expect(element).to.have.property("_id");
            assert(typeof element._id === "string");
          });
          done();
        } catch (err) {
          console.log(err.message);
        }
      }
    );
  });
});

describe("Test Genre counts", () => {
  let genres = [
    "action",
    "adventure",
    "animation",
    "comedy",
    "crime",
    "documentary",
    "drama",
    "family",
    "fantasy",
    "history",
    "horror",
    "music",
    "mystery",
    "romance",
    "science fiction",
    "tv movie",
    "thriller",
    "war",
    "western",
  ];

  it("should check if each key in the response object is a number", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/get_genre_frequencies",
      (error, response, body) => {
        assert(response.statusCode == 200);
        let res = JSON.parse(body);
        for (const key in res) {
          expect(genres).to.deep.include(key);
          assert(typeof res[key] === "number");
        }
        done();
      }
    );
  });
});

describe("Testing date query", () => {
  let dates = [
    "2023/02/12",
    "202z/02/192",
    "2023/02asfsf12",
    "2023/02/07",
    "2023/02/zzz12",
  ];
  dates.forEach((element) => {
    it("should check that the given date param is valid and validate the response fields", (done) => {
      request.get(
        `http://localhost:9999/query/group_queries_by_date_week?date=${element}`,
        (error, response, body) => {
          if (response.statusCode == 200) {
            console.log("ok");
            let res = JSON.parse(body);
            res.forEach((element) => {
              expect(element).to.have.property("day");
              expect(element).to.have.property("queries");
              expect(element).to.have.property("daily_queries");
              assert(typeof element.day === "string");
              assert(typeof element.queries === "number");
              assert(typeof element.daily_queries === "object");
              if (element.daily_queries.length != 0)
                element.daily_queries.forEach((daily_query) => {
                  expect(daily_query).to.have.property("hour");
                  expect(daily_query).to.have.property("queries");
                  expect(daily_query).to.have.property("hourly_queries");
                  if (daily_query.hourly_queries.length != 0)
                    daily_query.hourly_queries.forEach((hourly_query) => {
                      expect(hourly_query).to.have.property("timestamp");
                      expect(hourly_query).to.have.nested.property(
                        "data.entity.genre"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.entity.actor"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.entity.daterange"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.entity.moviename"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.intent"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.Actual_Message"
                      );
                      expect(hourly_query).to.have.nested.property(
                        "data.Response_Message"
                      );
                    });
                });
            });
          } else console.log("Bad request");
          done();
        }
      );
    });
  });
});
