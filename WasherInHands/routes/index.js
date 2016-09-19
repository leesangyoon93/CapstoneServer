var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var router = express.Router();
var User = mongoose.model('User');
var WasherRoom = mongoose.model('WasherRoom');

/* GET home page. */
module.exports = function(passport) {
    router.get('/', function (req, res) {
        res.render('index');
    });
    
    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        passReqToCallback: true
    }), function (req, res) {
        console.log(req.user);
        req.session.currentUser = user;
        if (req.user) return res.json(req.user);
        else
            return res.json({result: 'fail'});

    });

    // router.get('/register', function (req, res, next) {
    //     if (!req.user) {
    //         User.findOne({'userId': req.body.userId}, function(err, user) {
    //             if(err) return res.json({'result': 'fail'});
    //             if(user)
    //                 return res.json({'result': 'overlap'});
    //             else {
    //                 var newUser = new User();
    //                 newUser.userId = req.body.userId;
    //                 newUser.password = req.body.password;
    //                 newUser.userName = req.body.userName;
    //                 newUser.save(function (err) {
    //                     if (err) throw err;
    //                     req.login(user, function (err) {
    //                         if (err) return next(err);
    //                     });
    //                 });
    //                 return res.json(req.user);
    //             }
    //         })
    //     }
    // });

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
                    newUser.isAdmin = false;
                    newUser.save(function (err) {
                        if (err) throw err;
                        req.login(newUser, function (err) {
                            console.log(req.user);
                            if (err) return next(err);
                            return res.json(req.user);
                        });
                    });
                }
            })
        }
    });

    router.get('/getUser', function (req, res) {
        console.log(req.user);
        // User.findOne({'_id': req.body._id}, function(err, user) {
        //     if(err) throw err;
        //     if(user)
        //         return res.json(user);
        //     else return res.json(null);
        // })
        if (req.user)
            return res.json(req.user);
        else
            return res.json({'result': 'fail'});
    });

    router.post('/createGroup', function (req, res) {
        var washerRoom = new WasherRoom();
        washerRoom._host = req.user;
        washerRoom.roomName = "room3";
        washerRoom.address = 'address1';
        washerRoom.members.push(req.user);
        washerRoom.save();
        req.user.washerRooms.push(washerRoom);
        req.user.save();
        req.session.currentRoom = washerRoom;
        return res.json(washerRoom);
    });

    router.post('/joinGroup', function (req, res) {
        WasherRoom.findOne({'_id': req.body.id}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) {
                washerRoom.members.push(req.user);
                req.user.washerRooms.push(washerRoom);
                washerRoom.save();
                req.user.save();
            }
        });
    });

    router.get('/showJoinedGroup', function (req, res) {
        return res.json(req.user.washerRooms);
    });


    // inner group
    router.post('/showGroup', function (req, res) {
        WasherRoom.findOne({'_id': req.body.id}, function (err, washerRoom) {
            req.session.currentRoom = washerRoom;
            return res.json(washerRoom);
        });
    });

    router.post('/showGroupMember', function (req, res) {
        // WasherRoom.findOne({'_id': req.body.id}).exec(function (err, washerRoom) {
        //     if (err) throw err;
        //     if (washerRoom) {
        //         var users = {};
        //         for (var i in washerRoom.members)
        //             users[i] = washerRoom.members[i].userName;
        //     }
        //     return res.json(users); // or res.json(washerRoom.members) check
        // })
        return res.json(req.session.currentRoom.members);
    });

    router.post('/saveGroup', function (req, res) {

    });

    router.get('/deleteGroup', function (req, res) {
        req.session.currentRoom.remove();
    });

    router.get('/logout', function (req, res) {
        console.log(req.session.currentUser.userId);
        console.log(req.user.userId);
        req.logout();
        return res.json({'result': 'success'});
    });

    return router;
};
