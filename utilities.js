function extract_number_and_message(payload) {
  try {
    const number = "349050435943";
    // payload.entry[0].changes[0].value["messages"][0]["from"];
    const message = "actors in 'cdgghghffgh'";
    // payload.entry[0].changes[0].value["messages"][0]["text"]["body"];

    console.log(`number -> ${number}, message -> ${message}`);
    return { num: number, msg: message };
  } catch (err) {
    return null;
  }
}

function generate_body(intent, data) {
  let message = "";
  switch (intent) {
    case "message.get_movie_year":
      message = `${data.movie_name} was released in ${data.release_year}.`;
      break;
    case "message.get_actor":
      let male_list = `Actors: ${data.actors.male.slice(0, 5).join(", ")}`;
      let female_list = `Actress: ${data.actors.female.slice(0, 5).join(", ")}`;
      let other_list = `Others: ${data.actors.others.slice(0, 5).join(", ")}`;

      message = `Cast of ${data.movie_name}:
        ${male_list}.
        ${female_list}.
        ${other_list}.`;
      break;
    case "message.get_genre":
      message = `Genre of ${data.movie_name} is:
      ${data.genre.join(".\n")}.`;
      break;
    case "message.get_movie":
      message = data
        .map((movie) => {
          return `**${movie.title}**
${movie.genre.join(", ")}
Release Date: ${movie.release}
Rating: ${movie.rating}`;
        })
        .join("\n\n");
      break;
    case "message.get_plot":
      message = `${data.title}:
${data.plot}`;
      break;
    default:
      message = null;
      break;
  }
  return message;
}

function generate_payload(number, message_body) {
  let reply_body = JSON.stringify({
    messaging_product: "whatsapp",
    to: number,
    type: "text",
    text: {
      body: message_body,
    },
  });

  const config = {
    method: "post",
    url: "https://graph.facebook.com/v15.0/105933825735159/messages",
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`,
      "Content-Type": "application/json",
    },
    data: reply_body,
  };
  return config;
}

module.exports = {
  extract_number_and_message,
  generate_body,
  generate_payload,
};
