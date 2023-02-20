const fs = require("fs");
const { NlpManager } = require("node-nlp");
const path = require("path");

class NLP {
  constructor() {
    this.SCORE_THRESHOLD = 0.5;
    this.model_finished_loading = false;
    this.manager = new NlpManager();
    this.load_model();
  }
  /**
   * loads "mymodel.nlp" model from the file directory
   */
  load_model() {
    const file = path.join(process.cwd(), "NLP", "mymodel.nlp");
    const data = fs.readFileSync(file, "utf8");
    this.manager.import(data);
    this.model_finished_loading = true;
  }

  /**
   * extracts entities, intents and probability of intent from a given string
   * @param {string} message the message for whom the intents and entities are to be extracted
   * @returns {object} returns an object containing the entities, intent and the probability of said intent
   */
  async extract_characteristics(message) {
    const result = await this.manager.process("en", message);

    let our_entities = { genre: [], actor: [], daterange: [], moviename: [] };

    console.dir(result, { depth: null });

    result.entities.forEach((element) => {
      let entity_type = element["entity"];
      if (our_entities[entity_type] != null) {
        if (entity_type === "daterange")
          our_entities[entity_type].push(element["resolution"]["timex"]);
        else if (entity_type === "moviename")
          our_entities[entity_type].push(element["sourceText"]);
        else our_entities[entity_type].push(element["option"]);
      }
    });
    // console.log(our_entities);
    // console.log(result.classifications)
    return {
      entities: our_entities,
      intents: result.classifications[0].intent,
      score: result.classifications[0].score,
    };
  }

  async testing() {
    const result = await this.extract_characteristics(
      `romance movies starring leonardo dicaprio`
    );

    console.log(JSON.stringify(result.intents, null, 2));
  }
}

// const obj = new natural_language_processing_model();
// obj.load_model();
// obj.testing();

module.exports = { NLP };
