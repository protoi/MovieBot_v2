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
  it("check if response body is contains the required fields",  (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/group_documents_by_intents",
        (error, response, body) => {
            try {
                let parsedBody = JSON.parse(body);
                expect(parsedBody).to.be.a("array");
                parsedBody.forEach(element => {
                    //Check whether response from mongodb contains the fields _id and count
                    //Then respectively checking whether they have the correct 
                    expect(element).to.have.property("_id");
                    assert((typeof element._id) === "string");
                    expect(element).to.have.property("count");
                    assert(typeof element.count === "number");
                });
                done();
            }
            catch (err) {
                console.log(err.message);
            }
      }
    );
  });
});


describe("Test Genre counts", () => {
  it("should return a valid object containng the genres with their corresponding query counts", (done) => {
    // Make a request and get the response object
    request.get(
      "http://localhost:9999/query/get_genre_frequencies",
      (error, response, body) => {

        let parsedBody = JSON.parse(body);
        expect(parsedBody).to.have.property("horror");

        done();
      }
    );
  });
});