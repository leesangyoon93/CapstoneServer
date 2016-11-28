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
    timer: {
        type: function (state) {
            var timer = setInterval(function () {
                this.alarm = this.alarm - 1;
                this.save();
                if (this.alarm <= 0) {
                    // var message = new gcm.Message();
                    //
                    // var message = new gcm.Message({
                    //     collapseKey: 'demo',
                    //     delayWhileIdle: true,
                    //     timeToLive: 3,
                    //     data: {
                    //         title: '세탁몬 알림 메세지',
                    //         message: '세탁이 완료되었습니다! 찾아가주세요.'
                    //     }
                    // });
                    //
                    // var server_api_key = 'AIzaSyC2UxxXcjO6_x8LiswYgIDRj5c19ccXIKI';
                    // var sender = new gcm.Sender(server_api_key);
                    // var registrationIds = [];
                    //
                    // var token = token;
                    // registrationIds.push(token);
                    //
                    // sender.send(message, registrationIds, 4, function (err, result) {
                    //     console.log(result);
                    //     return res.json({'result': 'success'})
                    // });
                    clearInterval(timer);
                }
            }, 1000);
            if(!state) {
                clearInterval(timer);
            }
        }
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