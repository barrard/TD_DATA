module.exports = {
  all:get_all_commodity_symbols,
  group:get_commodity_group
}


function get_all_commodity_symbols(){
  let all = []
  for(group in symbols){
    all = [...all, ...symbols[group]]
  }
  return all
}

function get_commodity_group(group){
  return symbols[group]
}



const symbols= {
    // interest_rates
 INT_RATES:['/ZT','/ZF','/ZN','/TN','/ZB','/GE','/ZQ','/GLB','/UB'],
 // METALS
  METALS:[
     '/SIL','/GC','/SI','/HG','/MGC','/YG','/YI','/PL','/PA'
 ],
 
 // CURRENCY
  CURRENCY:[
     '/6A','/6B','/6C','/M6A','/M6B','/M6E','/J7','/6E','/6J','/6M','/E7','/6N','/6S','/DX'
 ],
 
 // GRAINS
  GRAINS:[
     '/ZC','/XC','/XW','/XK','/KE','/ZO','/ZS','/ZM','/ZL','/ZW'
 ],
 
 // IDNEX
  IDNEX:[
     '/NQ','/RTY','/ES','/EMD','/YM','/NKD','/VX','/BTC','/MES','/MNQ','/M2K','/MYM','/MME'
 ],
 
 // ENERGY
  ENERGY:[
     '/BZ','/QG','/RB','/HO','/CL','/NG','/QM'
 ],
 
 // SOFTS
  SOFTS:[
     '/CC','/KC','/CT','/OJ','/SB'
 ],
 
 // FORST
  FORST:[
     '/LBS'
 ],
 //LIVE STOCK
 LIVE:[
   '/GF','/HE','/LE'
 ]
 
}