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

    var getUser = function (userId) {
        User.findOne({'userId': userId}, function (err, user) {
            if (err) throw err;
            if (user) return user;
            else return null;
        })
    };

    var getWasherRoom = function (roomName) {
        WasherRoom.findOne({'roomName': roomName}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) return washerRoom;
            else return null;
        })
    };

    router.get('/getUser', function (req, res) {
        User.findOne({'userId': req.query.userId}, function (err, user) {
            console.log(user);
            if (err) throw err;
            if (user) return res.json(user);
            else return res.json({'result': 'fail'});
        })
    });

    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        passReqToCallback: true
    }), function (req, res) {
        if (req.user) return res.json(req.user);
        else return res.json({result: 'fail'});
    });

    router.post('/register', function (req, res, next) {
        User.findOne({'userId': req.body.userId}, function (err, user) {
            if (err) return res.json({'result': 'fail'});
            if (user)  return res.json({'result': 'overlap'});
            else {
                var newUser = new User();
                newUser.userId = req.body.userId;
                newUser.password = req.body.password;
                newUser.userName = req.body.userName;
                newUser.isAdmin = false;
                newUser.save(function (err) {
                    if (err) throw err;
                    req.login(newUser, function (err) {
                        if (err) return next(err);
                        return res.json(newUser);
                    });
                });
            }
        });
    });

    router.post('/editPassword', function(req, res) {
        User.findOne({'userId': req.body.userId}, function(err, user) {
            if(err) return res.json({'result': 'fail'});
            if(user) {
                user.password = req.body.password;
                user.save();
                return res.json({'result': 'success'});
            }
            else return res.json({'resut': 'fail'});
        })
    });

    router.post('/createGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) return res.json({'result': 'overlap'});
            else {
                User.findOne({'userId': req.body.userId}, function (err, user) {
                    console.log(user);
                    if (err) throw err;
                    if (user) {
                        var newWasherRoom = new WasherRoom();
                        newWasherRoom._host = user;
                        newWasherRoom.roomName = req.body.roomName;
                        newWasherRoom.address = req.body.address;
                        newWasherRoom.members.push(user);
                        newWasherRoom.save(function (err) {
                            if (err) return res.json({'result': 'fail'});
                        });
                        user.washerRooms.push(newWasherRoom);
                        user.save(function (err) {
                            if (err) return res.json({'result': 'fail'});
                        });
                        return res.json(newWasherRoom);
                    }
                    else return res.json({'result': 'fail'});
                })
            }
        });
    });

    router.post('/joinGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) {
                User.findOne({'userId': req.body.userId}, function (err, user) {
                    if (err) return res.json({'result': 'fail'});
                    if (user) {
                        washerRoom.members.push(user);
                        user.washerRooms.push(washerRoom);
                        washerRoom.save();
                        user.save();
                        return res.json(washerRoom);
                    }
                    else return res.json({'result': 'fail'});
                })
            }
            else return res.json({'result': 'fail'});
        });
    });

    router.get('/showJoinedGroup', function (req, res) {
        var groupArray = [];
        var count = 0;

        User.findOne({'userId': req.query.userId}, function (err, user) {
            if (err) return res.json({'result': 'fail'});
            if (user) {
                for (var i = 0; i < user.washerRooms.length; i++) {
                    var id = new ObjectId(user.washerRooms[i]);
                    WasherRoom.findById(id, function (err, washerRoom) {
                        if (err) return res.json({'result': 'fail'});
                        if (washerRoom) {
                            groupArray.push(washerRoom);
                            count++;
                        }
                        else count++;

                        if (count == user.washerRooms.length) {
                            console.log(groupArray);
                            return res.json(groupArray);
                        }
                    })
                }
            }
            else return res.json({'result': 'fail'});
        });
    });


    // inner group
    router.post('/showGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.body.roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) return res.json(washerRoom);
            else return res.json({'result': 'fail'});
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

        WasherRoom.findOne({'roomName': roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) {
                for (var i = 0; i < washerRoom.members.length; i++) {
                    var id = new ObjectId(washerRoom.members[i]);
                    User.findById(id, function (err, user) {
                        if (err) throw err;
                        if (user) {
                            memberArray.push(user);
                            count++;
                        }
                        else count++;

                        if (count == washerRoom.members.length)
                            return res.json(memberArray);
                    })
                }
            }
            else return res.json({'result': 'fail'});
        })
    });

    router.post('/saveGroup', function (req, res) {

    });

    router.get('/deleteGroup', function (req, res) {
        WasherRoom.findOne({'roomName': roomName}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) {
                washerRoom.remove();
                return res.json({'result': 'success'});
            }
            else return res.json({'result': 'fail'});
        });
    });

    router.get('/logout', function (req, res) {
        req.logout();
        return res.json({'result': 'success'});
    });

    return router;
};
