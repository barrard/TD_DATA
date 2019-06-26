var redis = require("redis")
var client = redis.createClient()
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

client.on('connect', function() {
  console.log('Redis client connected');
});
client.on('error', function (err) {
  console.log('Something went wrong ');
});

 async function get(item_to_get) {
  // new Promise(function(resolve, reject) {
 
  logger.log(`get ${item_to_get} from redis`)
    let resp= await getAsync(item_to_get)
     if(!resp ){
       logger.log('not found')
       return (false)
     }else{
       logger.log('Data found')
       let data = JSON.parse(resp)
        // logger.log(data)
       return data
     }
    


}

function set(item_to_set, value_to_set, expire) {
  if(expire){
    logger.log(`set ${item_to_set} to expire ${expire}`)
    client.set(item_to_set, JSON.stringify(value_to_set), "EX", expire)

  }else{

    logger.log(`set ${item_to_set} to not expire`)
    client.set(item_to_set, JSON.stringify(value_to_set))
  }
}



module.exports = {
  get: get,
  set: set

}