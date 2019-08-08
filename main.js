let {
  get_minute_data,
  request_historical_data,
  request_all_movers,
  get_commodities_quote
} = require("./request_historical_data.js");
let {
  bars_to_csv,
  get_start_end_dates,
  get_most_recent_day
} = require("./utils/transform.js");
let { save_data, open_file, save_fd } = require("./utils/files.js");
let Symbols = require("./utils/symbols.js");
require("./db/db.js");
let Quote = require("./controllers/Quote_Controller.js");
const minutley_data_path = symbol =>
  `./TD_data/${symbol}/${symbol}_minutely.csv`;
const daily_data_path = symbol => `./TD_data/${symbol}/${symbol}_daily.csv`;
/* Some main functions to run.... */
// minutely_data_test('MSFT');
// get_all_symbol_data();
/* getting a list of symbols */

// let movers = request_all_movers()
// logger.log({movers})
//  get_historical_daily_data("GE");
// get_all_daily()
// get_minutely_data('INTC');

// forward_fill_data('INTC')
// forward_fill_ALL_minutely_data()
run_commodity_watcher();
var commodity_watcher_timer;
function run_commodity_watcher() {
  logger.log("run this function");
  commodity_watcher_timer = setInterval(async () => {
    let commodities_quotes = await get_commodities_quote()
    Quote.insert_quotes_data(commodities_quotes)
  }, 2000);
  /* Use in testing to limit watcher */
  // setTimeout(() => {
  //   stop_commodity_watcher();
  // }, 10000);
}
function stop_commodity_watcher() {
  clearInterval(commodity_watcher_timer);
}
async function forward_fill_ALL_minutely_data() {
  Symbols.forEach((symbol, index) => {
    setTimeout(() => {
      forward_fill_minutely_data(symbol);
    }, 1000 * index);
  });
}
// need to forward fill the Data, first, minutely
async function forward_fill_minutely_data(symbol) {
  /* look up the data on file */
  let { csv_file_data, appendable_fd } = await open_file(
    minutley_data_path(symbol)
  );
  let last_day = await get_most_recent_day(csv_file_data);
  logger.log({ last_day });
  /* get data starting here, and ending at a cirrent time */
  let now = new Date().getTime();
  bars = await get_minute_data(`${symbol}`, last_day, now);
  let csv_data = await bars_to_csv(bars, false); //header is false here
  save_fd(appendable_fd, csv_data);
}
function get_all_symbol_data() {
  logger.log(Symbols);
  Symbols.forEach((symbol, index) => {
    setTimeout(() => {
      get_minutely_data(symbol);
    }, 5000 * index);
  });
}

async function get_all_daily() {
  Symbols.forEach((symbol, index) => {
    setTimeout(() => {
      get_historical_daily_data(symbol);
    }, 1000 * index);
  });
}

async function get_historical_daily_data(symbol) {
  /* first check to see if data already exists */
  let { csv_file_data, appendable_fd } = await open_file(
    daily_data_path(symbol)
  );
  var bars;
  if (!csv_file_data) {
    /* get data from the beggining */
    bars = await request_historical_data(`${symbol}`, 0, new Date().getTime());
  } else {
    /* check the dates we have and get data around it */
    logger.log("check the dates we have and get data around it ");
    let { start, end } = await get_start_end_dates(csv_file_data);

    bars = await request_historical_data(`${symbol}`, start, end);
  }
  if (!bars) return;
  if (bars && bars.length == 1) {
    logger.log(bars);
    return logger.log("No more data");
  }

  logger.log(bars[0].datetime);
  logger.log(bars[bars.length - 1].datetime);
  logger.log("=======================================");
  let include_headers = csv_file_data ? false : true;
  let csv_data = await bars_to_csv(bars, include_headers); //header is false here
  save_fd(appendable_fd, csv_data);
  // setTimeout(() => get_historical_daily_data(symbol), 2000);
}
/* Testing get minutely data */
async function get_minutely_data(symbol) {
  /* first check to see if data already exists */
  let { csv_file_data, appendable_fd } = await open_file(
    minutley_data_path(symbol)
  );
  var bars;
  if (!csv_file_data) {
    /* get data from the beggining */
    bars = await get_minute_data(`${symbol}`, 0, new Date().getTime());
  } else {
    /* check the dates we have and get data around it */
    logger.log("check the dates we have and get data around it ");
    let { start, end } = await get_start_end_dates(csv_file_data);

    bars = await get_minute_data(`${symbol}`, start, end);
  }
  if (!bars) return;
  if (bars && bars.length == 1) {
    logger.log(bars);
    return logger.log("No more data");
  }

  logger.log(bars[0].datetime);
  logger.log(bars[bars.length - 1].datetime);
  logger.log("=======================================");
  let include_headers = csv_file_data ? false : true;
  let csv_data = await bars_to_csv(bars, include_headers); //header is false here
  save_fd(appendable_fd, csv_data);
  setTimeout(() => get_minutely_data(symbol), 2000);
}
