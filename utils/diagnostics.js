
require("./logger.js");
const { bars_to_csv, csv_to_json, decend_timestamps } = require("./transform.js");

const {
  save_data,
  make_path_exist,
  make_dir,
  read_file, close_fd,
  init_file,open_file, save_fd, w_trucate_fd
} = require("./files.js");
const DATA_DIR = "./data";


module.exports = {
  remove_dups
}

/* check the increments? */
async function check_minutly_increments(symbol){
  logger.log(`${symbol}`.blue)
  let file_path = `./data/${symbol}/minutely_${symbol}.csv`
  let json_data = await get_data(file_path)
  logger.log(json_data.length)
  json_data.map((data, index) =>{
    // logger.log(data)
    let time =data.t
    let next_time = json_data[index+1].t
    let time_diff = time - next_time
    // logger.log(time_diff)
    if(time_diff < -60 ){
      logger.log(data)
      logger.log(json_data[index+1])

    }
  })

}

async function get_data(file_path){
  let {csv_file_data} = await open_file(file_path);
  let json_data = await csv_to_json(csv_file_data);
  return json_data
}


remove_dups('MSFT')
async function remove_dups(symbol){

  let data_path = `${DATA_DIR}/${symbol}`;
  let filename = `minutely_${symbol}.csv`;
  let file_path = `${data_path}/${filename}`;
  let {csv_file_data, appendable_fd} = await open_file(file_path);

  let json_data = await csv_to_json(csv_file_data);
  logger.log(`starting with ${json_data.length}`)

  const filteredArr = json_data.reduce((acc, current) => {
    const x = acc.find(item => item.datetime === current.datetime);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  let arr_len = filteredArr.length
  logger.log(`ending with ${arr_len}`);
  let time_ordered_json = await decend_timestamps(filteredArr)
  // logger.log(filteredArr[arr_len-1])
  // logger.log(filteredArr[0].datetime)
  // let date_0 = new Date((parseInt(filteredArr[0].datetime)))
  // logger.log({date_0})
  // let date_end = new Date(parseInt(filteredArr[arr_len-1].datetime))
  // logger.log({date_end})
  /* close file */
  close_fd(appendable_fd)
  /* transfor to csv, and open file to be truncated with the filtered data */
  let writable_fd = await w_trucate_fd(file_path)
  let header = true
  let csv_data = await bars_to_csv(time_ordered_json, header);
  await save_fd(writable_fd, csv_data);
  logger.log('confir?')
}