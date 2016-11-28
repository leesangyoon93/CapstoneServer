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
        type: String,
        unique: false
    },
    password: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now()
    },
    mainRoomName: {
        type: String,
        default: ""
    },
    alarm: {
        type: Number,
        default: 0
    },
    washerRooms: [{type: Schema.Types.ObjectId, ref: 'WasherRoom'}]
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