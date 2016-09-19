/**
 * Created by Sangyoon on 2016-05-22.
 */
// Load the correct configuration file according to the 'NODE_ENV' variable
module.exports = require('./env/' + process.env.NODE_ENV + '.js');