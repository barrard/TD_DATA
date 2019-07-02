require('./logger.js')
let {open_file} = require('./files.js')


get_main_tickers()

async function get_main_tickers(){
  
  let {csv_file_data, appendable_fd} = await open_file('./data/previous.json')
  let symbol_data = JSON.parse(csv_file_data)
  logger.log(symbol_data.length);
  let main = symbol_data.filter((i)=> i.close > 5 && i.volume > 1000000)
  logger.log(main.length)


  // return
  for (let x = 0; x < 200; x++) {
    const i = main[x];
    logger.log(i.symbol)
    logger.log(i.close)
    logger.log(i.volume)
  }
  // sorted_vol.map(vol => logger.log(vol.volume))
  let sym = []
  main.map(d => {
    if(!hasNumbers(d.symbol)){
      console.log(d+' has no ints')
      sym.push({symbol:d.symbol, price: d.close, vol: d.volume})
    }
      
    })
      let sorted_vol = sym.sort((a, b) => high_to_low(a, b, "vol"))


  logger.log(sorted_vol)



}

function hasNumbers(t)
{
var regex = /\d/g;
return regex.test(t);
}
function high_to_low(a, b, prop) {
  if (a[prop] > b[prop]) return -1;
  if (a[prop] < b[prop]) return 1;
  return 0;
}