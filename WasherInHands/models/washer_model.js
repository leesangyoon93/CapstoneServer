/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var WasherSchema = new Schema({
    washerRoom: {type: Schema.Types.ObjectId, ref: 'WasherRoom'},
    module: {
        type: String,
        unique: true
    },
    runTime: {
        type: Number,
        default: 0
    },
    isTrouble: {
        type: Boolean,
        default: false
    },
    x: Number,
    y: Number
});

mongoose.model('Washer', WasherSchema);