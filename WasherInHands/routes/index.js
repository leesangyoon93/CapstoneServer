var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = mongoose.model('User');

/* GET home page. */
module.exports = function (passport) {
    router.get('/', function (req, res, next) {
        if(req.isAuthenticated())
            res.redirect('/main/');
        else res.render('index');
    });

    router.get('/main/', function (req, res) {
        if(!req.isAuthenticated())
            res.redirect('/');
        else res.render('main');
    });

    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        passReqToCallback: true
    }), function(req, res) {
        if(req.user) return res.json({result:'success'});
    });

    router.post('/register', function (req, res, next) {
        if (!req.user) {
            var user = new User(req.body);
            user.save(function (err) {
                if (err)
                    return res.json({result: 'fail'});

                req.login(user, function (err) {
                    if (err) return next(err);
                    return res.json({result: 'success'});
                })
            })
        }
        else return res.json({result: 'success'});
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    return router;
};
