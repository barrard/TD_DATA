require("dotenv").config();
require("./utils/logger.js");
const {save_data} = require('./utils/files.js')
const files = require("./utils/files.js");
// require("./db.js");
var request = require("request");
const rp = require("request-promise");
// var access_token = process.env.ACCESS_TOKEN;
var refresh_token = process.env.REFRESH_TOKEN;
var OAUTH_CODE = process.env.OAUTH_CODE;
const TD_Data_Model = require("./TD_Data_Model.js");
let { access_token } = require("./access_token.js");
// logger.log({ access_token });

module.exports = {
  request_all_movers, request_data, get_minute_data
}

// request_historical_data("IBM");
// request_historical_data('FB')

// get_all_data()

// get_all_previous_daily_data();
// get_all_comodity_data_data()
// get_minute_data('/GC')
// get_last_daily_data('FB')

/* Helper functions */
function iex_api() {
  return "https://api.iextrading.com/1.0";
}
function high_to_low(a, b, prop) {
  if (a[prop] > b[prop]) return -1;
  if (a[prop] < b[prop]) return 1;
  return 0;
}
/* Gets all symbols from iex api */
async function fetch_iex_previous() {
  logger.log("fetch_iex_previous");
  let resp = await rp(`${iex_api()}/stock/market/previous`);
  let json_Data = JSON.parse(resp);
  /* put all into an array */
  let data = [];
  for (let symbol in json_Data) {
    let sym_data = { symbol, ...json_Data[symbol] };
    data.push(sym_data);
  }
  let volume_filtered = data.sort((a, b) => high_to_low(a, b, "volume"));
  return volume_filtered;
}

/* Gets all symbols form iex api */
async function fetch_iex_symbols() {
  let resp = await rp(`${iex_api()}/ref-data/symbols`);
  let json_Data = JSON.parse(resp);
  return json_Data;
}
//interest request_new_access_token
// /ZT,/ZF,/ZN,/TN,/ZB,/GE,/ZQ,/GLB,/UB
//METALS
// /SIL,/GC,/SI/,HG,/MGC,/YG,/YI,/PL,/PA
//CURRENCY
// /6A,/6B,/6C,/M6A,/M6B,/M6E,/J7,/6E,/6J,/6M,/E7,/6N,/6S,/DX
//GRAINS
// /ZC,/XC,/XW,/XK,KE,/ZO,/ZS,/ZM,/ZL,/ZW
//IDNEX
// /NQ,/RTY,/ES,/EMD,/YM,/NKD,/VX,/BTC,/MES,/MNQ,/M2K,/MYM,/MME
//ENERGY
// /BZ,/QG,/RB,/HO,/CL,/NG,/QM
//SOFTS
// /CC,/KC,/CT,/OJ,/SB
//FORST
// /LBS
//LIVE STOCK
// /GF,/HE,/LE
async function get_all_comodity_data_data() {
  let SYMBOLS = ["/ES", "/GC", "/CL", "/NG", "/SI", "/ZB", "/ZN"];

  var counter = -1;
  var total = SYMBOLS.length;
  let timer = setInterval(async () => {
    counter++;
    const symbol = SYMBOLS[counter];
    logger.log(`counter = ${counter} requesting ${symbol}`);

    let daily_data = await request_historical_data(symbol);
    TD_Data_Model.create_daily_data(symbol, daily_data);
  }, 1000);
}

async function get_all_data() {
  let volume_filtered = await fetch_iex_previous();

  var counter = -1;
  var total = volume_filtered.length;
  let timer = setInterval(async () => {
    counter++;
    const symbol = volume_filtered[counter].symbol;
    logger.log(`counter = ${counter} requesting ${symbol}`);

    let daily_data = await request_historical_data(symbol);
    TD_Data_Model.create_daily_data(symbol, daily_data);
  }, 1000);
}

/* Just gets the last one day bar into DB */
async function get_all_previous_daily_data() {
  logger.log("get_all_previous_daily_data");
  await request_new_access_token();

  /* First very we are getting new data */
  let new_daily_data = await get_last_daily_data("FB");
  logger.log(new_daily_data);
  let new_date = new_daily_data.datetime;
  let db_has = await TD_Data_Model.get_symbol("FB");
  let last_date_db_has =
    db_has.daily_data[db_has.daily_data.length - 1].datetime;
  if (new_date == last_date_db_has) return;

  /* Once new data is confirmed, we move forward with getting it alllllll */

  let volume_filtered = await TD_Data_Model.get_symbols_list();
  logger.log(volume_filtered.length);

  var counter = -1;
  var total = volume_filtered.length;
  let timer = setInterval(async () => {
    counter++;
    const symbol = volume_filtered[counter].symbol;
    logger.log(`counter = ${counter} requesting ${symbol}`);

    let new_daily_data = await get_last_daily_data(symbol);
    logger.log(new_daily_data);
    TD_Data_Model.add_previous_daily_data(symbol, new_daily_data);
    if (counter + 1 == total) clearInterval(timer);
  }, 510);
}


/* Gets daily data for month, but just grab the last day and stick into DB */
// get_last_daily_data('FB')
async function get_last_daily_data(symbol) {
  logger.log("get_last DAILY _data");
  /* get symbols list */
  // let symbols = await TD_Data_Model.get_symbols_list()
  // logger.log(symbols)
  // logger.log(symbols.length)

  try {
    /* 156 5-minute bars a day */

    let now = new Date().getTime();
    const options = {
      url: `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?periodType=month&frequencyType=daily&endDate=${now}`,
      //  `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?periodType=day&period=2&frequencyType=minute&frequency=5&endDate=${'1556100060000'}`,
      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    var resp = await rp(options);
    var { candles, empty } = JSON.parse(resp);
    if (empty) throw `${symbol} data is empty`;
    // logger.log(candles)

    logger.log(candles[candles.length - 1]);
    logger.log("resp");
    return candles[candles.length - 1];
  } catch (err) {
    logger.log("err");
    logger.log(err);
    // for (let k in err) {
    //   logger.log(k);
    // }
    if (err.message) {
      let expired_token = err.message.includes(
        "The access token being passed has expired or is invalid"
      );
      if (expired_token) {
        logger.log("get new token");
        await request_new_access_token();
        // get_minute_data(symbol);
      }
    }
  }
}


async function get_minute_data(symbol, start, end) {
  logger.log({start, end})
  logger.log(`get_minute_data from ${new Date(start)}, to ${new Date(end)}`);


  try {

    const options = {
      url: `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?periodType=day&frequencyType=minute&frequency=1&endDate=${end}&startData=${start}`,
      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    logger.log(options.url)
    let resp = await rp(options);
    let { candles, empty } = JSON.parse(resp);
    if (empty) throw `${symbol} data is empty`;

    // logger.log(candles[0]);
    // logger.log(candles[candles.length - 1]);
    logger.log(candles.length);
    logger.log("resp");
    return candles;
  } catch (err) {
    logger.log("err");
    logger.log(err);
    handle_expired_token_error(err, get_minute_data, arguments[0]);

  }
}
async function request_all_movers() {
  const markets = ["$SPX.X", "$DJI", "$COMPX"];
  const total = markets.length;
  var count = 0;
  let movers_data = {
    "$SPX.X": {
      down: {
        value: [],
        percent: []
      },
      up: {
        value: [],
        percent: []
      }
    },
    '$DJI': {
      down: {
        value: [],
        percent: []
      },
      up: {
        value: [],
        percent: []
      }
    },
    '$COMPX': {
      down: {
        value: [],
        percent: []
      },
      up: {
        value: [],
        percent: []
      }
    }
  };
  let timer = await setInterval(async () => {
    let sym = markets[count]
    //up, percent
    movers_data[sym]["up"]["percent"] = await request_movers(
      sym,
      "up",
      "percent"
    );

    //up, value
    setTimeout(async () => {
      movers_data[sym]["up"]["value"] = await request_movers(
        sym,
        "up",
        "value"
      );
    }, 510 * 1);

    //down, percent
    setTimeout(async () => {
      movers_data[sym]["down"]["percent"] = await request_movers(
        sym,
        "down",
        "percent"
      );
    }, 510 * 2);

    //down, value
    setTimeout(async () => {
      movers_data[sym]["down"]["value"] = await request_movers(
        sym,
        "down",
        "value"
      );
    }, 510 * 3);

    count++;
    if (count == total) {
      clearInterval(timer);
      logger.log('Error prone way to wait for data!')
      setTimeout(async()=>{
        logger.log("ALL DONE GETTING MARKET MOVERS".green);
        logger.log(movers_data);
        save_data('MOVERS', 'MOVERS.csv', JSON.stringify(movers_data), false)
        return movers_data
      }, 6000)

    }
  }, 510 * 4);
};


// request_movers('$DJI', 'up','value')
async function request_movers(index, dir, chng) {
  logger.log(`getting ${index}, ${dir}, ${chng}`)
  try {
    let url = `https://api.tdameritrade.com/v1/marketdata/${index}/movers?direction=${dir}&change=${chng}`;

    const options = {
      url,

      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    var resp = await rp(options);
    return JSON.parse(resp);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err.message);
    handle_expired_token_error(err, request_movers, arguments[0]);
  }
}

async function request_data({
  symbol,
  period_type, //day, month, year, ytd
  period, //1, 2, 3, 4, 5, 6, 10, 15, 20
  frequency_type, //minute, day, weekly, monthly
  frequency,
  start_date,
  end_date
}){
  var url = `https://api.tdameritrade.com/v1/marketdata/${encodeURIComponent(
    symbol
  )}/pricehistory?`;
  if (period) url += `period=${period}&`;
  url += `periodType=${period_type}&frequency=${frequency}&frequencyType=${frequency_type}`;
  if (start_date) url += `&startDate=${start_date}`;
  if (end_date) url += `&endDate=${end_date}`;
  logger.log({ url });

  try {
    const options = {
      url,

      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    var resp = await rp(options);
    var { candles, empty } = JSON.parse(resp);
    if (empty) throw `${symbol} data is empty`;
    // logger.log(candles)
    logger.log(candles.length);
    /* check first 5 and last 5 */
    let head = candles.slice(0, 5);
    let tail = candles.slice(-5);
    logger.log({ head, tail });
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err.message);
    if (err.message) {
      let expired_token = err.message.includes(
        "The access token being passed has expired or is invalid"
      );
      if (expired_token) {
        logger.log("get new token");
        setTimeout(async () => {
          logger.log("Getting new access token");
          await request_new_access_token();
          request_data(arguments[0]);
        }, 0);
      }
    }
  }
};

async function handle_expired_token_error(err, fn, args) {
  if (err.message) {
    let expired_token = err.message.includes(
      "The access token being passed has expired or is invalid"
    );
    if (expired_token) {
      logger.log("get new token");
      setTimeout(async () => {
        logger.log("Getting new access token");
        await request_new_access_token();
        fn(args);
      }, 0);
    }
  }
}

const request_data_params = {
  symbol: "/ES:XCME",
  period_type: "day",
  period: "10",
  frequency_type: "minute",
  frequency: "1"
  // start_date: new Date().getTime() - 1000 * 60 * 60*24*10,
  // end_date: new Date().getTime()
};

// request_data(request_data_params);

async function request_historical_data(symbol) {
  try {
    logger.log(
      `using access_token ${access_token
        .split("")
        .splice(0, 11)
        .join("")}`
    );
    let now = new Date().getTime();
    const options = {
      url: `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?periodType=month&frequencyType=daily&startDate=0&endDate=${now}`,
      //`https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?periodType=day&period=30&frequencyType=minute&frequency=5`,
      method: "get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    var resp = await rp(options);
    var { candles, empty } = JSON.parse(resp);
    if (empty) throw `${symbol} data is empty`;
    // logger.log(candles)
    logger.log(candles.length);
    logger.log("resp");
    return candles;
  } catch (err) {
    logger.log("err");
    logger.log(err);
    // for (let k in err) {
    //   logger.log(k);
    // }
    if (err.message) {
      let expired_token = err.message.includes(
        "The access token being passed has expired or is invalid"
      );
      if (expired_token) {
        logger.log("get new token");
        setTimeout(async () => {
          logger.log("Getting new access token");
          await request_new_access_token();
          request_historical_data(symbol);
        });
      }
    }
  }
}

// request_new_access_token()
async function request_new_access_token() {
  logger.log(`Request new token`);
  try {
    const options = {
      url: "https://api.tdameritrade.com/v1/oauth2/token",
      method: "post",
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        // access_type: "offline",
        client_id: "BARRARD@AMER.OAUTHAP"
        // redirect_uri: "https://localhost:8443"
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
        // Authorization: `Bearer ${access_token}`
      }
    };
    var resp = await rp(options);
    resp = JSON.parse(resp);
    console.log(access_token);
    logger.log(
      `ooollldddd access_token ${access_token
        .split("")
        .splice(0, 11)
        .join("")}`
    );

    // logger.log(resp);

    logger.log(resp.access_token);
    access_token = resp.access_token;
    files.write_access_token(access_token);

    logger.log(
      `neeeeww access_token ${access_token
        .split("")
        .splice(0, 11)
        .join("")}`
    );

    // for (let k in resp) {
    //   logger.log(k);
    // }
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
