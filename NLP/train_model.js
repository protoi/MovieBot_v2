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
    "Who was the actor in 'Rise of the planet of the apes'",
    "What genre is 'RIse of the planet of the apes'",
    "is 'rise of the planet of the apes' a comedy movie",
    "who were the actors in 'Spiderman'",
    "name of the girl in 'Avengers age of ultron'",
    "what was the genre of 'Titanic'",
    "show me action and horror movies of tom hanks and johnny depp",
    "when did 'titanic' come out",
    "which year did 'rise of the planet of the apes' get released",
    "which year did 'avengers age of ultron' get released",
    "release date of action and horror movie starring tom hanks",
    "show me actor list of 'rise of the planet of the apes'",
    "list of actors in 'superman returns'",
    "In which year 'SpiderMan 2' was released",
    "Give me Tom Holland's latest movies ",
    "Give me Sylvester Stallone's latest movies"
  ];
  const answers = [
    "message.get_actor",
    "message.get_genre",
    "message.get_genre",
    "message.get_actor",
    "message.get_actor",
    "message.get_genre",
    "message.get_movie",
    "message.get_movie_year",
    "message.get_movie_year",
    "message.get_movie_year",
    "message.get_movie_year",
    "message.get_actor",
    "message.get_actor",
    "message.get_movie_year",
    "message.get_movie",
    "message.get_movie",
  ];
  // Train the network
  await manager.train();
  manager
    .save("mymodel.nlp")
    .then(async (response) => {
      console.log("model written");
      for (let index = 0; index < queries.length; index++) {
        const Q = queries[index];
        const answer = answers[index];
        try {
          const results = await manager.process("en", Q);
          console.log(
            `==========${Q}==========\n${
              results.classifications[0].intent
            }\n======================\n${
              results.classifications[0].intent === answer
              //   JSON.stringify(
              //   // results.entities,
              //   null,
              //   2
              // )
            }`
          );
        } catch (err) {
          console.log(`${Q} FAILED`);
        }
      }
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
