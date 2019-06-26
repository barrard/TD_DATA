const { AsyncParser, parseAsync } = require("json2csv");
const fs = require("fs-extra");

require("./utils/logger.js");
const {
  save_data,
  make_path_exist,
  make_dir,
  read_file,
  init_file,open_file, save_fd
} = require("./utils/files.js");
// const Request_Data = require('./request_historical_data.js')
// const {request_all_movers, request_data} = request_data
const {
  request_all_movers,
  request_data,
  get_minute_data
} = require("./request_historical_data.js");

const DATA_DIR = "./data";

get_all_minutely_data("INTC");
/* systematically get minutly data */
async function get_all_minutely_data(symbol) {
  /* Look for the file */
  let data_path = `${DATA_DIR}/${symbol}`;
  let filename = `minutely_${symbol}.csv`;
  let file_path = `${data_path}/${filename}`;
  await make_path_exist(data_path);

  /* Read the file */
  /* ensure files exists */
  let {csv_file_data, fd} = await open_file(file_path);

  if (!csv_file_data.length) {
    /* Start a whole new data pull from the start*/
    logger.log(`no data yet for ${filename}`);
    let start = new Date("2019", "5", "24", "0", "0");
    let end = new Date("2019", "5", "25", "0", "0");

    let bars = await get_minute_data(symbol,start, end)

    /* Write the data? */
    let header = true
    let csv_data = await bars_to_csv(data, header);
    save_fd(fd, csv_data);
  } else {
    /* pick up where it left off, maybe even appeneed the the start? */
  }
}

async function bars_to_csv(data, header) {
  let data_length = data.length;
  let counter = 0
  const fields = ["open", "high", "low", "close", "datetime"];
  const opts = { fields, header };
  let csv = await parseAsync(data, opts)
  .then(csv => (csv))
  .catch(err => console.error(err));
  // console.log(csv)
  return csv
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
}

/* Not as useful as should be :( */
// update_movers_data()
async function update_movers_data() {
  let movers_data = await request_all_movers();
}
