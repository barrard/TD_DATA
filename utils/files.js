require("./logger.js");
const fs = require("fs-extra");
const access_token_path = "./access_token.js";

module.exports = {
  save_data,
  write_access_token,
  make_path_exist,
  make_dir,
  read_file,
  init_file,
  close_fd,
  open_file,
  save_fd,
  get_file_stats,
  w_trucate_fd,
  check_file_data
};

async function check_file_data(path) {
  let exists = await fs.pathExists(path);
  if (!exists) return false;

  let buff = await read_file(path);
  if (buff.length) {
    logger.log(buff.length);
    return buff.length;
  } else {
    return false;
  }
}

async function get_file_stats(file) {
  try {
    let stats = await fs.stat(file);
    // logger.log(stat)
    return stats;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

async function save_fd(fd, data) {
  try {
    await fs.write(fd, data + "\r\n");
    await fs.close(fd);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
async function w_trucate_fd(file_path) {
  try {
    let fd = await fs.open(file_path, "w");
    return fd;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
async function open_file(file_path) {
  try {
    /* first check of rexistance, and or create it */
    let path = get_path(file_path);

    let exists = await make_path_exist(path);
    /* Open file for read and append*/
    let appendable_fd = await fs.open(file_path, "a+");
    let file_stats = await get_file_stats(file_path);
    /* Read the file */
    var file_buffer = new Buffer(file_stats.size);

    let { bytesRead, buffer } = await fs.read(
      appendable_fd,
      file_buffer,
      0,
      file_buffer.length,
      null
    );
    let csv_file_data = buffer.toString("utf8", 0, buffer.length);

    return { csv_file_data, appendable_fd };
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

async function init_file(file_path) {
  try {
    /* Open file */
    let fd = await fs.open(file_path, "a+");
    return await fs.close(fd);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
async function close_fd(fd) {
  try {
    return await fs.close(fd);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}
async function read_file(file) {
  let buffer = await fs.readFile(file);
  logger.log(buffer);
  logger.log(buffer.length);

  return buffer;
}

async function save_data(dir, symbol, name, data, append) {
  try {
    logger.log(`writing ${symbol}, ${name}`);
    let done = await write_file(`./${dir}/${symbol}/${name}`, data, append);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

/* MAIN */
async function write_access_token(token) {
  try {
    let code = `
  module.exports ="${token}"
  `;
    logger.log({ access_token_path });
    let mod_exp = "module.exports.access_token =`" + token + "`";
    let done = await write_file(access_token_path, mod_exp, false);
    if (done) logger.log("Success, new token saved".green);
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
  }
}

//open file
async function write_file(filename, data, append) {
  try {
    let flag = append ? "a" : "w";
    /* check path exists */
    //pathExists
    let path = get_path(filename);

    let exists = await make_path_exist(path);

    let fd = await fs.open(filename, flag);
    fs.write(fd, data);
    return true;
  } catch (err) {
    if (err) throw err;
  }
}

async function make_dir(path) {
  logger.log(`making dir with ${path}`);
  try {
    logger.log({ path });
    await fs.mkdirp(path);
    return true;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
    return false;
  }
}

async function make_path_exist(path) {
  // logger.log("checking if path exists");
  try {
    /* assuming full filename and path */

    let exists = await fs.pathExists(path);
    if (!exists) await make_dir(path);

    return exists;
  } catch (err) {
    logger.log("err".bgRed);
    logger.log(err);
    return false;
  }
}
function get_path(filename) {
  let path = filename.split("/");
  path.pop();
  return path.join("/");
}
