const { AsyncParser, parseAsync, parse } = require("json2csv");
const csv = require("csvtojson");

module.exports = {
  bars_to_csv,
  csv_to_json,
  decend_timestamps,
  get_start_end_dates,
  get_most_recent_day
};

async function get_most_recent_day(csv_file_data) {
  let json_data = await csv_to_json(csv_file_data);
  let time_ordered_json = await decend_timestamps(json_data);
  /* The end of the array if what we want here */
  return time_ordered_json[time_ordered_json.length - 1].datetime;
}
async function get_start_end_dates(csv_file_data) {
  let json_data = await csv_to_json(csv_file_data);

  /* check clean data */
  let time_ordered_json = await decend_timestamps(json_data);

  let data_len = time_ordered_json.length;
  let newest = time_ordered_json[data_len - 1].datetime;
  let oldest = time_ordered_json[0].datetime;
  let month = 1000 * 60 * 60 * 24 * 30;
  logger.log({ data_len, newest, oldest, month });
  return { start: oldest - month, end: oldest };
}
async function csv_to_json(csv_data) {
  let json = await csv({
    // noheader:true,
    // output: "csv"
  }).fromString(csv_data);
  return json;
}

async function decend_timestamps(data) {
  return data.sort((a, b) => low_to_high(a, b, "datetime"));
}

function low_to_high(a, b, prop) {
  if (a[prop] > b[prop]) return 1;
  if (a[prop] < b[prop]) return -1;
  return 0;
}
function high_to_low(a, b, prop) {
  if (a[prop] > b[prop]) return -1;
  if (a[prop] < b[prop]) return 1;
  return 0;
}

async function bars_to_csv(data, header = false) {
  try {
    // let data_length = data.length;
    let counter = 0;
    const fields = ["open", "high", "low", "close", "datetime", "volume"];
    const opts = { fields, header };
    logger.log(`header = ${opts.header}`);
    let csv = await parseAsync(data, opts)
      .then(csv => csv)
      .catch(err => console.error(err));
    // console.log(csv)
    return csv;
    // const transformOpts = { highWaterMark: 8192 };
    // const asyncParser = new AsyncParser(opts, transformOpts);
    // let csv = "";
    // asyncParser.processor
    //   .on("data", chunk => (csv += chunk.toString()))
    //   .on("end", () => )
    //   .on("error", err => console.error(err));

    // asyncParser.transform
    //   .on("header", header => console.log(header))
    //   .on("line", line => {
    //     if (counter == 0) logger.log(`Line 0 = ${line}`);
    //     counter++;
    //     if (counter == data_length) logger.log(`Data at ${counter} : ${line}`);
    //   })
    //   .on("error", err => console.log(err));
    // asyncParser.input.push(JSON.stringify(data)); // This data might come from an HTTP request, etc.
    // asyncParser.input.push(null); // Sending `null` to a stream signal that no more data is expected and ends it.
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
