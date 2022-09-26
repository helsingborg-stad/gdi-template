// ensure .env file is merged into process.env as soon as possible 
require('dotenv').config()

// display ENV at startup to ensure developer confidence...
const debug = require('debug')('application')
debug(process.env)


require('./dist')