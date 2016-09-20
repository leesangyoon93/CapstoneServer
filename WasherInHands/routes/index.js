var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var router = express.Router();
var User = mongoose.model('User');
var WasherRoom = mongoose.model('WasherRoom');
var ObjectId = require('mongodb').ObjectId;

/* GET home page. */
module.exports = function (passport) {
    router.get('/', function (req, res) {
        res.render('index');
    });

    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        passReqToCallback: true
    }), function (req, res) {
        if (req.user) return res.json(req.user);
        else return res.json({result: 'fail'});
    });

    router.post('/register', function (req, res, next) {
        if (!req.user) {
            User.findOne({'userId': req.body.userId}, function (err, user) {
                if (err) return res.json({'result': 'fail'});
                if (user)
                    return res.json({'result': 'overlap'});
                else {
                    var newUser = new User();
                    newUser.userId = req.body.userId;
                    newUser.password = req.body.password;
                    newUser.userName = req.body.userName;
                    newUser.isAdmin = true;
                    newUser.save(function (err) {
                        if (err) throw err;
                        req.login(newUser, function (err) {
                            if (err) return next(err);
                            return res.json(req.user);
                        });
                    });
                }
            })
        }
    });

    router.get('/getUser', function (req, res) {
        if (req.user)
            return res.json(req.user);
        else
            return res.json({'result': 'fail'});
    });

    router.post('/createGroup', function (req, res) {
        if (req.user) {
            WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
                if (err) return res.json({'result': 'fail'});
                if (washerRoom) return res.json({'result': 'overlap'});
                else {
                    var newWasherRoom = new WasherRoom();
                    newWasherRoom._host = req.user;
                    newWasherRoom.roomName = req.body.roomName;
                    newWasherRoom.address = req.body.address;
                    newWasherRoom.members.push(req.user);
                    newWasherRoom.save(function (err) {
                        if (err) return res.json({'result': 'fail'});
                    });
                    req.user.washerRooms.push(newWasherRoom);
                    req.user.save(function (err) {
                        if (err) return res.json({'result': 'fail'});
                    });
                    req.session.currentRoom = newWasherRoom;
                    return res.json(newWasherRoom);
                }
            })
        }
        else return res.json({'result': 'fail'});
    });

    router.post('/joinGroup', function (req, res) {
        // 중복검사( 이미 가입되어 있으면 안되게 )
        WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) {
                washerRoom.members.push(req.user);
                req.user.washerRooms.push(washerRoom);
                washerRoom.save();
                req.user.save();
                req.session.currentRoom = washerRoom;
                return res.json(washerRoom);
            }
            else
                return res.json({'result': 'fail'});
        });
    });

    router.get('/showJoinedGroup', function (req, res) {
        var groupArray = [];
        var count = 0;

        for (var i = 0; i < req.user.washerRooms.length; i++) {
            var id = new ObjectId(req.user.washerRooms[i]);
            WasherRoom.findById(id, function (err, washerRoom) {
                if (err) throw err;
                if (washerRoom) {
                    groupArray.push(washerRoom);
                    count++;
                }
                else count++;

                if (count == req.user.washerRooms.length) {
                    console.log(groupArray);
                    return res.json(groupArray);
                }
            })
        }
    });


    // inner group
    router.post('/showGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
            req.session.currentRoom = washerRoom;
            return res.json(washerRoom);
        });
    });

    router.get('/showAllGroup', function (req, res) {
        WasherRoom.find().exec(function (err, washerRooms) {
            return res.json(washerRooms);
        })
    });

    router.get('/showGroupMember', function (req, res) {
        var memberArray = [];
        var count = 0;

        for (var i = 0; i < req.session.currentRoom.members.length; i++) {
            var id = new ObjectId(req.session.currentRoom.members[i]);
            User.findById(id, function (err, user) {
                if (err) throw err;
                if (user) {
                    memberArray.push(user);
                    count++;
                }
                else count++;

                if (count == req.session.currentRoom.members.length) {
                    return res.json(memberArray);
                }
            })
        }
    });

    router.post('/saveGroup', function (req, res) {

    });

    router.get('/deleteGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.session.currentRoom.roomName}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) {
                washerRoom.remove();
                req.session.currentRoom = null;
            }
        });
    });

    router.get('/logout', function (req, res) {
        req.logout();
        return res.json({'result': 'success'});
    });

    return router;
};
