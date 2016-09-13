/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var WasherRoomSchema = new Schema({
    _host: {type: Number, ref: 'User'},
    roomName: {
        type: String,
        unique: true
    },
    address: {
        type: String
    },
    users: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

mongoose.model('WasherRoom', WasherRoomSchema);