const dosomething = (req, res) => {
  console.log(req.query );

  /*
  req.query -> 
    detail: weekly, daily
    
    detail == week:
        starting_point: some date format like dd-mm-yyyy or the week # of the year ? 
   */

  res.send("Hello World");
};

module.exports = { dosomething };
