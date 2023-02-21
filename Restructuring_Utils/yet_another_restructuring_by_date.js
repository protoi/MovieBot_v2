let daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Fixes formatting for restructurd query Object
 * @param {Object} data Restructured Query
 * @returns {Array.<Object>}
 */

let yet_another_restructuring = (data) => {
  // console.log(ty)

  for (let day of daysOfWeek) {
    // Check if the current day is already in the data array
    let existingDay = data.find((d) => d.day === day);

    // If it's not, add it with queries = 0 and an empty daily_queries array
    if (!existingDay) {
      data.push({ day: day, queries: 0, daily_queries: [] });
    }
  }

  // Sort the data array by day of the week
  data.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

  // First, create a new array with all 24 hours represented
  let allHours = Array.from(Array(24).keys()).map((h) => h.toString());

  data.forEach((element) => {
    if (element.queries == 0) return;
    let queryData = element.daily_queries;
    // If not, add a new object for that hour with queries set to 0 and an empty hourly_queries array.
    allHours.forEach((hour) => {
      let hourExists = queryData.some((obj) => obj.hour === hour);
      if (!hourExists) {
        queryData.push({
          hour: hour,
          queries: 0,
          hourly_queries: [],
        });
      }
    });

    // Finally, sort the query data array by hour to ensure it's in the correct order.
    queryData.sort((a, b) => a.hour - b.hour);

    element.daily_queries = queryData;
  });

  return data;
};

module.exports = { yet_another_restructuring };
