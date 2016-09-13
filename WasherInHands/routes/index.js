var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var router = express.Router();
var User = mongoose.model('User');
var WasherRoom = mongoose.model('WasherRoom');

/* GET home page. */
module.exports = function (passport) {
    router.get('/', function (req, res) {
        res.render('index');
    });

    router.get('/profile', function(req, res) {
        // User.findOne({'_id': req.body._id}, function(err, user) {
        //     if(err) throw err;
        //     if(user)
        //         return res.json(user);
        //     else return res.json(null);
        // })
        return res.json(req.user);
    });

    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        passReqToCallback: true
    }), function (req, res) {
        if (req.user) return res.json(req.user);
    });

    router.get('/register', function (req, res, next) {
        if (!req.user) {
            var user = new User();
            user.userId = req.body.userId;
            user.password = req.body.password;
            user.userName = req.body.userName;
            user.save(function (err) {
                if (err) throw err;
                req.login(user, function (err) {
                    if (err) return next(err);
                });
            });
            return res.json(req.user);
        }
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
    router.post('/showGroup', function(req, res) {
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

    router.post('/saveGroup', function(req, res) {
        
    });

    router.get('/deleteGroup', function(req, res) {

    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};
