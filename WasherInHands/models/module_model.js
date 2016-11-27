/**
 * Created by Sangyoon on 2016-09-22.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var ModuleSchema = new Schema({
    moduleId: {
        type: String,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Module', ModuleSchema);