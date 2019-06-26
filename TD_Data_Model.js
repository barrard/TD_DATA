const mongoose = require("mongoose");
const redis = require("./redis.js");

// const Crowdsale = require('./crowdsale.js')
// const redis = require('../db/redis.js')
const TD_Data_Schema = mongoose.Schema({
  symbol: { type: String, index: {unique:true}},
  daily_data: [
    {
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number,
      datetime:Number,
    }
  ],
  five_minute_data: [
    {
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number,
      datetime:Number,
    }
  ]
});

const TD_Daily_Data = mongoose.model(
  "td_daily_data",
  TD_Data_Schema
);
module.exports = TD_Daily_Data;
TD_Daily_Data.get_daily_data_for = get_daily_data_for;
TD_Daily_Data.update_daily_stock_data = update_daily_stock_data;
TD_Daily_Data.get_symbol = get_symbol;
TD_Daily_Data.get_symbols_list = get_symbols_list
TD_Daily_Data.create_daily_data = create_daily_data
TD_Daily_Data.get_limited_symbol_data = get_limited_symbol_data
TD_Daily_Data.add_previous_daily_data = add_previous_daily_data
TD_Daily_Data.add_MA_price_data= add_MA_price_data

async function get_symbols_list(){
  /* adding redis */
  var symbols;
   symbols=await redis.get(`symbols_list`);
   logger.log(symbols)
   if(!symbols){
    logger.log('getting list')
    symbols = await TD_Daily_Data.find({}, {symbol:1})
   logger.log('returngin lit')
   redis.set(`symbols_list`, symbols, (1*60*60*24*30));

  }
  
  
  return symbols
}

async function add_MA_price_data(symbol, price_data_with_MA_data){
  let before_update = new Date().getTime()

  // logger.log({id_20})
     await TD_Daily_Data.findOneAndUpdate({
      symbol:symbol
    }, {$set:{daily_data:price_data_with_MA_data}})

    let after_update = new Date().getTime()
logger.log(after_update - before_update)

  
}
async function add_previous_daily_data(symbol, data){
   let done = await update_daily_stock_data(symbol, data)
   return done
}

async function add_five_minute_data(symbol, data){
  try {
    let resp = await TD_Daily_Data.findOneAndUpdate({
      symbol, symbol
    }, {
      $push:{five_minute_data:data}
    })
    if(!resp) throw `error for ${symbol}`
  } catch (err) {
    console.log('err')
    console.log(err)
  }

}

async function create_daily_data(symbol, daily_data){
  logger.log(`saving ${symbol} data = ${daily_data.length}`)
  let new_data = new TD_Daily_Data({
    symbol, daily_data
  })
  new_data.save()

}

/* positive limit gets the first(older) data, negative number get last(newer) data */
async function get_limited_symbol_data(symbol, limit){
  let datas = await TD_Daily_Data.findOne({symbol:symbol}, {daily_data :{$slice:limit}})
  return datas

}



async function get_symbol(symbol){
  let datas = await TD_Daily_Data.findOne({symbol:symbol})
  return datas

}

async function update_daily_stock_data(symbol, data) {

  try {
    let done = await TD_Daily_Data.findOneAndUpdate(
      { symbol: symbol },
      { $push  :{ daily_data : data }}
    );
    if(!done) return{failed:symbol}
    else return {done:symbol}
    // logger.log(comapny_data)
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
    return{err}
  }
}

async function get_daily_data_for(symbol) {
  try {
    // let daily_data = await redis.get(`${symbol}_daily`)
    // logger.log(daily_data)
    // if(!daily_data){
      logger.log(`getting data from DB`)
      let daily_data = await TD_Daily_Data.findOne(
        { symbol: symbol }
      );
      // await redis.set(`${symbol}_daily`, daily_data)
      if(!daily_data) throw `No data found for ${symbol}`
      return daily_data
    // }else{
      // logger.log(`found in redis`)

      // return daily_data
    // }
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}


