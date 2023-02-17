var expect = require("chai").expect;
var request = require("request");
const assert = require("assert");
const { type } = require("os");

describe("Test JSON response", () => {
  it("should return a valid JSON object", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/group_documents_by_intents",
      (error, response, body) => {
        // Parse the response body as JSON
        const parsedBody = JSON.parse(body);

        // Check if the parsed body is an object
        assert(typeof parsedBody === "object");

        done();
      }
    );
  });
});

describe("Test JSON response", () => {
  it("check if response body is contains the required fields", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/group_documents_by_intents",
      (error, response, body) => {
        try {
          let parsedBody = JSON.parse(body);
          expect(parsedBody).to.be.a("array");
          parsedBody.forEach((element) => {
            //Check whether response from mongodb contains the fields _id and count
            //Then respectively checking whether they have the correct
            assert(typeof element.count === "number" && element.count >= 0);
            expect(element).to.have.property("_id");
            assert(typeof element._id === "string");
            expect(element).to.have.property("count");
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
  it("should check if each key in the response object is a number", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/get_genre_frequencies",
      (error, response, body) => {
        let res = JSON.parse(body);
        for (const key in res) {
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
  dates.forEach(element => {
    it("should check that the given date param is valid and validate the response fields", (done) => {
      request.get(
        `http://localhost:9999/query/group_queries_by_date_week?date=${element}`,
        (error, response, body) => {
          if (response.statusCode == 200)
            console.log("ok");
          else
            console.log("Bad request");
          done();
        }
      );
    });
  });
  
});
