/* Controller of the quotes data  */

const Quote = require("../models/quote_model.js");

// console.log('quote controller')

module.exports = Quote;

Quote.insert_quote = insert_quote
Quote.insert_quotes_data = insert_quotes_data



async function insert_quotes_data(quotes){
	for (k in quotes ){
		insert_quote(quotes[k])
	}
}

async function insert_quote(data) {
    try {
			logger.log((data.totalVolume))
			logger.log((data.symbol))
			// logger.log(data.bidPriceInDouble)
	
			// logger.log(data.askPriceInDouble)
			// logger.log(data.lastPriceInDouble)
			// logger.log(data.futureSettlementPrice)
        let new_quote = new Quote(data)
				await new_quote.save()
    } catch (err) {
        logger.log('err'.bgRed)
        logger.log(err)
    }


}
