const { dockStart } = require("@nlpjs/basic");

(async () => {
  const dock = await dockStart({
    settings: {
      nlp: {
        forceNER: true,
        languages: ["en"],
        autoSave: false,
        corpora: ["./corpus.json"],
      },
    },
    use: ["Basic", "LangEn"],
  });

  const manager = dock.get("nlp");

  const queries = [
    "Who was the actor in Rise of the planet of the apes",
    "What genre is RIse of the planet of the apes",
    "is rise of the planet of the apes a comedy movie",
    "who were the actors in Spiderman",
    "name of the girl in Avengers age of ultron",
    "what was the genre of Titanic",
    "show me action and horror movies of tom hanks and johnny depp",
    "when did titanic come out",
    "which year did rise of the planet of the apes get released",
    "which year did avengers age of ultron get released",
    "release date of action and horror movie starring tom hanks",
  ];
  const answers = {};
  // Train the network
  await manager.train();
  manager
    .save("mymodel.nlp")
    .then((response) => {
      console.log("model written");
      //   queries.forEach((Q) => {
      //     manager
      //       .process("en", Q)
      //       .then((result) => {
      //         console.log(`query ---> ${Q}`);
      //         console.log(JSON.stringify(result.classifications, null, 2));
      //         answers[Q] = JSON.stringify(result.classifications, null, 2);
      //       })
      //       .catch((err) => {
      //         console.error(err.message);
      //       });
      //   });
    })
    .catch((err) => {
      console.log(err.message);
    });
  //   console.table(answers);
})();
