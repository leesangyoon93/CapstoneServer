/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WasherRoomSchema = new Schema({
    host: {
        type: String,
        unique: true
    },
    roomName: {
        type: String,
        unique: true
    },
    address: {
        type: String
    },
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    washers: [{type: Schema.Types.ObjectId, ref: 'Washer'}]
});

mongoose.model('WasherRoom', WasherRoomSchema);