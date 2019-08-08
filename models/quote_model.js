const mongoose = require("mongoose");

const Quote_schema = mongoose.Schema({
  assetType: { type: String },
  symbol: { type: String },
  bidPriceInDouble: { type: Number },
  askPriceInDouble: { type: Number },
  lastPriceInDouble: { type: Number },
  bidSizeInLong: { type: Number },
  askSizeInLong: { type: Number },
  bidId: { type: String },
  askId: { type: String },
  totalVolume: { type: Number },
  lastSizeInLong: { type: Number },
  quoteTimeInLong: { type: Number },
  tradeTimeInLong: { type: Number },
  highPriceInDouble: { type: Number },
  lowPriceInDouble: { type: Number },
  closePriceInDouble: { type: Number },
  exchange: { type: String },
  description: { type: String },
  lastId: { type: String },
  openPriceInDouble: { type: Number },
  changeInDouble: { type: Number },
  futurePercentChange: { type: Number },
  exchangeName: { type: String },
  securityStatus: { type: String },
  openInterest: { type: Number },
  mark: { type: Number },
  tick: { type: Number },
  tickAmount: { type: Number },
  product: { type: String },
  futurePriceFormat: { type: String },
  futureTradingHours: { type: String },
  futureIsTradable:  { type: Boolean },
  futureMultiplier: { type: Number },
  futureIsActive:  { type: Boolean },
  futureSettlementPrice: { type: Number },
  futureActiveSymbol: { type: String },
  futureExpirationDate: { type: Number },
  delayed: { type: Boolean },
  date: { type: Date, default: Date.now }

});


module.exports = mongoose.model('Quote', Quote_schema)
