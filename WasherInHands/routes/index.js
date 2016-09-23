var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var router = express.Router();
var User = mongoose.model('User');
var WasherRoom = mongoose.model('WasherRoom');
var Washer = mongoose.model('Washer');
var Module = mongoose.model('Module');
var ObjectId = require('mongodb').ObjectId;

/* GET home page. */
module.exports = function (passport) {
    router.get('/', function (req, res) {
        res.render('index');
    });

    router.get('/getUser', function (req, res) {
        User.findOne({'userId': req.query.userId}, function (err, user) {
            if (err) throw err;
            if (user) return res.json(user);
            else return res.json({'result': 'fail'});
        })
    });

    router.post('/login', function (req, res) {
        User.findOne({'userId': req.body.userId}, function (err, user) {
            if (err) return res.json({'result': 'fail'});
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password))
                    return res.json(user);
                else return res.json({'result': 'failPw'});
            }
            else return res.json({'result': 'failId'});
        })
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

    router.post('/editPassword', function (req, res) {
        User.findOne({'userId': req.body.userId}, function (err, user) {
            if (err) return res.json({'result': 'fail'});
            if (user) {
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
                    if (err) throw err;
                    if (user) {
                        var newWasherRoom = new WasherRoom();
                        newWasherRoom.host = user.userId;
                        newWasherRoom.roomName = req.body.roomName;
                        newWasherRoom.address = req.body.address;
                        newWasherRoom.members.push(user);
                        if(user.washerRooms.length == 0 && user.mainRoomName == "")
                            user.mainRoomName = newWasherRoom.roomName;
                        user.washerRooms.push(newWasherRoom);
                        newWasherRoom.save(function (err) {
                            if (err) return res.json({'result': 'fail'});
                        });
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
                        for(var i=0; i<user.washerRooms.length; i++) {
                            if(user.washerRooms[i].equals(washerRoom._id)) {
                                return res.json({'result': 'overlap'});
                            }
                        }
                        washerRoom.members.push(user);
                        if(user.washerRooms.length == 0 && user.mainRoomName == "")
                            user.mainRoomName = washerRoom.roomName;
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

    router.get('/searchGroup', function(req, res) {
        var search = req.query.searchName;
        search = search.replace(/\s/gi, '');
        WasherRoom.find({'roomName': {"$regex": search}}, function(err, washerRooms) {
            if(err) return res.json({'result': 'fail'});
            if(washerRooms) return res.json(washerRooms);
        })
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

                        if (count == user.washerRooms.length)
                            return res.json(groupArray);
                    })
                }
            }
            else return res.json({'result': 'fail'});
        });
    });

    router.get('/getGroup', function(req, res) {
        WasherRoom.findOne({'roomName': req.query.roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) return res.json(washerRoom);
            else return res.json({'result': 'fail'});
        });
    });
    // inner group
    router.get('/getHost', function (req, res) {
        WasherRoom.findOne({'roomName': req.query.roomName}, function (err, washerRoom) {
            if (err) return res.json({'result': 'fail'});
            if (washerRoom) {
                User.findOne({'userId': req.query.userId}, function(err, user) {
                    if(err) return res.json({'result': 'fail'});
                    if(user) {
                        if(washerRoom.host == user.userId)
                            return res.json({'result': 'success'});
                        else
                            return res.json({'result' : 'fail'});
                    }
                    else return res.json({'result': 'fail'});
                })
            }
            else return res.json({'result': 'fail'});
        });
    });

    router.get('/setMainRoom', function(req, res) {
       User.findOne({'userId': req.query.userId}, function(err, user) {
           if(err) return res.json({'result': 'fail'});
           if(user) {
               user.mainRoomName = req.query.mainRoomName;
               user.save();
               return res.json({'result': 'success'});
           }
           else return res.json({'result': 'fail'});
       })
    });

    router.get('/exitGroup', function(req, res) {
       WasherRoom.findOne({'roomName': req.query.roomName}, function(err, washerRoom) {
           if(err) return res.json({'result' : 'fail'});
           if(washerRoom) {
               User.findOne({'userId': req.query.userId}, function(err, user) {
                   if(err) return res.json({'result': 'fail'});
                   if(user) {
                       if(user.mainRoomName == req.query.roomName) {
                           user.mainRoomName = ""
                       }
                       for(var i=0; i<washerRoom.members.length; i++) {
                           if(washerRoom.members[i].equals(user._id)) {
                               washerRoom.members.splice(i, 1);
                               washerRoom.save();
                               break;
                           }
                       }
                       for(var j=0; j<user.washerRooms.length; j++) {
                           if(user.washerRooms[j].equals(washerRoom._id)) {
                               user.washerRooms.splice(j, 1);
                               user.save();
                               return res.json({'result': 'success'});
                           }
                       }
                       return res.json({'result': 'success'});
                   }
                   else return res.json({'result': 'fail'});
               })
           }
           else return res.json({'result': 'fail'});
       })
    });

    router.get('/showAllGroup', function (req, res) {
        WasherRoom.find().exec(function (err, washerRooms) {
            return res.json(washerRooms);
        })
    });

    router.get('/showGroupMember', function (req, res) {
        var memberArray = [];
        var count = 0;

        WasherRoom.findOne({'roomName': req.query.roomName}, function (err, washerRoom) {
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

    router.get('/deleteGroup', function (req, res) {
        WasherRoom.findOne({'roomName': req.query.roomName}, function (err, washerRoom) {
            if (err) throw err;
            if (washerRoom) {
                User.find(function(err, users) {
                    if(err) return res.json({'result': 'fail'});
                    if(users) {
                        for(var i=0; i<users.length; i++) {
                            for(var j=0; j<users[i].washerRooms.length; j++) {
                                if(users[i].washerRooms[j].equals(washerRoom._id)) {
                                    if(users[i].mainRoomName == washerRoom.roomName)
                                        users[i].mainRoomName = "";
                                    users[i].washerRooms.splice(j, 1);
                                    users[i].save();
                                }
                            }
                        }
                        washerRoom.remove();
                        return res.json({'result': 'success'});
                    }
                    else return res.json({'result' : 'fail'});
                });
            }
            else return res.json({'result': 'fail'});
        });
    });

    router.get('/logout', function (req, res) {
        req.logout();
        return res.json({'result': 'success'});
    });

    router.post('/findModule', function(req, res) {
        Module.findOne({'moduleId': req.body.moduleId}, function(err, module) {
            if(err) return res.json({'result': 'fail'});
            if(module) return res.json({'result': 'success'});
            else return res.json({'result': 'fail'});
        })
    });

    router.post('/saveGroup', function (req, res) {
        var machines = JSON.parse(req.body.machine);
        var count = 0;

        console.log(machines);
        console.log(machines.length);

        WasherRoom.findOne({'roomName': req.body.roomName}, function(err, washerRoom) {
            if(err) return res.json({'result': 'fail'});
            if(washerRoom) {
                var id = new ObjectId(washerRoom._id);
                Washer.find({'washerRoom': id}, function(err, washers) {
                    if(err) return res.json({'result': 'fail'});
                    if(washers) {
                        for(var i=0; i<washers.length; i++) {
                            washers[i].remove();
                        }
                        for(var j=0; j<machines.length; j++) {
                            var washer = new Washer();
                            washer.washerRoom = washerRoom;
                            washer.x = machines[j].x;
                            washer.y = machines[j].y;
                            washer.module = machines[j].module;
                            washer.save();
                            count++;
                            if(count == machines.length)
                                return res.json({'result': 'success'});
                        }
                    }
                });
            }
            else return res.json({'result' : 'fail'});
        })
    });

    router.get('/getWasher', function(req, res) {
        WasherRoom.findOne({'roomName': req.query.roomName}, function(err, washerRoom) {
            if(err) return res.json({'result': 'fail'});
            if(washerRoom) {
                var id = washerRoom._id;
                Washer.find({'washerRoom': new ObjectId(id)}, function(err, washers) {
                    if(err) return res.json({'result': 'fail'});
                    if(washers) return res.json(washers);
                    else return res.json({'result': 'fail'});
                })
            }
            else return res.json({'result': 'fail'})
        })
    });

    return router;
};
