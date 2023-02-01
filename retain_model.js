const fs = require("fs");
const { NlpManager } = require("node-nlp");
const path = require("path");

class natural_language_processing_model {
  constructor() {
    this.manager = new NlpManager();
    // this.load_model();
  }
  load_model() {
    const file = path.join(process.cwd(), "mymodel.nlp");
    const data = fs.readFileSync(file, "utf8");
    this.manager.import(data);
  }

  async extract_characteristics(message) {
    const result = await this.manager.process("en", message);

    let our_entities = { genre: [], actor: [], daterange: [], moviename: [] };

    // console.dir(result);

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
    };
  }

  async testing() {
    const result = await this.extract_characteristics(
      `is "the dark knight" and "spirited away" a comedy and action movie?`
    );

    console.log(JSON.stringify(result.entities, null, 2));
  }
}

const obj = new natural_language_processing_model();
obj.load_model();

obj.testing();

module.exports = { natural_language_processing_model };
