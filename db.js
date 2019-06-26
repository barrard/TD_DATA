require('dotenv').config()
const mongoose = require('mongoose');
const db_name = process.env.DB_NAME || 'TD_DATA'
logger.log({db_name})
// mongoose.set('debug', true);

mongoose.connect(`mongodb://localhost/${db_name}`,  { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false


})
  .then(connection => {
    logger.log('Connected to MongoDB')
  })
  .catch(error => {
    logger.log(error.message)
  })
