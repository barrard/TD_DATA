const { AsyncParser, parseAsync } = require("json2csv");
const fs = require("fs-extra");

require("./utils/logger.js");
const {
  bars_to_csv,
  csv_to_json,
  decend_timestamps
} = require("./utils/transform.js");

const {
  save_data,
  make_path_exist,
  make_dir,
  read_file,
  init_file,
  open_file,
  save_fd
} = require("./utils/files.js");
// const Request_Data = require('./request_historical_data.js')
// const {request_all_movers, request_data} = request_data
const {
  request_all_movers,
  request_data,
  get_minute_data
} = require("./request_historical_data.js");

const DATA_DIR = "./data";

get_all_minutely_data("MSFT");
/* systematically get minutly data */
async function get_all_minutely_data(symbol) {
  /* Look for the file */
  let data_path = `${DATA_DIR}/${symbol}`;
  let filename = `minutely_${symbol}.csv`;
  let file_path = `${data_path}/${filename}`;
  await make_path_exist(data_path);

  /* Read the file */
  /* ensure files exists */
  let { csv_file_data, appendable_fd } = await open_file(file_path);

  if (!csv_file_data.length) {
    /* Start a whole new data pull from the start*/
    logger.log(`no data yet for ${filename}`);
    let end = new Date().getTime();
    // let end = new Date("2019", "5", "25", "0", "0").getTime();
    let start = 0

    let bars = await get_minute_data(symbol, start, end);
    if (!bars) return;

    logger.log(bars.length);
    /* Write the data? */
    let header = true;
    let csv_data = await bars_to_csv(bars, header);
    save_fd(appendable_fd, csv_data);
    setTimeout(() => get_all_minutely_data(symbol), 5000);
  } else {
    logger.log("read the data and add to it".yellow);
    let json_data = await csv_to_json(csv_file_data);
    logger.log(`we have ${json_data.length} data points`);

    /* check clean data */
    let time_ordered_json = await decend_timestamps(json_data);
    // logger.log(time_ordered_json)
    logger.log(time_ordered_json.length);

    let data_len = time_ordered_json.length;
    let newest = parseInt(time_ordered_json[data_len - 1].datetime);
    let oldest = parseInt(time_ordered_json[0].datetime);
    logger.log({ oldest, newest });
    logger.log({ oldest: new Date(oldest), newest: new Date(newest) });
    let month = 1000 * 60 * 60 * 24 * 30;
    let bars = await get_minute_data(
      symbol,
      new Date(oldest - month).getTime(),
      new Date(oldest).getTime()
    );
    if (!bars) return;
    logger.log(bars.length);
    let csv_data = await bars_to_csv(bars);

    /* write the data */
    save_fd(appendable_fd, csv_data);
    setTimeout(() => get_all_minutely_data(symbol), 5000);
  }
}

/* Not as useful as should be :( */
// update_movers_data()
async function update_movers_data() {
  let movers_data = await request_all_movers();
}
