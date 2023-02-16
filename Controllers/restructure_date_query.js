const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let restructure_query = (query) => {
  //removing the other _id values

  query = query.filter((obj) => obj._id !== "other");

  //Placing the query object elements in an array

  let arr = [];
  query.forEach((element) => {
    arr.push(element);
  });

  arr.sort(
    (element1, element2) => new Date(element1._id) - new Date(element2._id)
  );

  //Restructured data
  let restructured_arr = [];

  arr.forEach((element) => {
    //The re structured element that is going to be part of output array
    let restructured_element = {};

    //Converting date from yyyy/mm/dd format to weekday

    let day = weekday[new Date(element._id).getDay()];
    restructured_element.day = day;

    //In doc_array we put the docs array of each element
    let doc_array = [];
    element.docs.forEach((elements) => {
      doc_array.push(elements);
    });

    let queries = doc_array.length;
    restructured_element.queries = queries;
      let daily_queries = [];
      


      let hour_wise_docs = {};
      
      //From the doc array elements we extract out th erequired fields for our response format

    doc_array.forEach((elements) => {
      let hour = new Date(elements.Time_Stamp).getHours();
      let temp_obj = {};
      temp_obj.timestamp = elements.Time_Stamp;
      let obj = {};
      obj.entity = elements.EntityIntent_tuple.entities;
      obj.intent = elements.EntityIntent_tuple.intents;
      obj.Actual_Message = elements.Query_Message;
      obj.Response_Message = elements.Response_Body;
      temp_obj.data = obj;
      if (!hour_wise_docs[hour]) {
        hour_wise_docs[hour] = [temp_obj];
      } else {
        hour_wise_docs[hour].push(temp_obj);
      }
    });
      
      //From the hour_wise_docs we build the dayly_queries
      
      let hours = Object.keys(hour_wise_docs);
      hours.forEach(hour => {
          
          let obj = {};
          obj.hour = hour;
          obj.queries = hour_wise_docs[hour].length;
          obj.hourly_queries = hour_wise_docs[hour];

          daily_queries.push(obj);
        
      });
      //console.log(hours);
    //console.log(hour_wise_docs);
    restructured_element.daily_queries = daily_queries;
    restructured_arr.push(restructured_element);
  });
  console.log(restructured_arr);
  return restructured_arr;
};

module.exports = { restructure_query };
