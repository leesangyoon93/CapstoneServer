/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    userId: {
        type: String,
        unique: true
    },
    userName: {
        type: String
    },
    password: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.pre('save', function (next) {
    var user = this;

    if(!user.isModified('password'))
        return next();
    else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

mongoose.model('User', UserSchema);