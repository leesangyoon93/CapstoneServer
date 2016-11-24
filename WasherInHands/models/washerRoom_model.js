/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WasherRoomSchema = new Schema({
    host: {
        type: String,
        unique: false
    },
    roomName: {
        type: String,
        unique: true
    },
    address: {
        type: String
    },
    longtitude: {
        type: Number,
        default: 0
    },
    latitude: {
        type: Number,
        default: 0
    },
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    enabled: {
        type: Boolean,
        default: false
    }
});

// WasherRoomSchema.pre('remove', function(next) {
//     // Remove all the assignment docs that reference the removed person.
//     this.model('User').remove({ person: this._id }, next);
// });

mongoose.model('WasherRoom', WasherRoomSchema);