const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in user model
let User = require('../models/user');

// Register Form
router.get('/register',function(req,res){
    res.render('register');
});

// Register Process
router.post('/register',function(req,res){
const name = req.body.name;
const email = req.body.emial;
const username = req.body.username;
const password = req.body.password;
const password2 = req.body.password2;

req.checkBody('name', 'Name is required').notEmpty();
req.checkBody('email', 'email is required').notEmpty();
req.checkBody('email', 'Email is not valid').isEmail();
req.checkBody('username', 'username is required').notEmpty();
req.checkBody('password', 'Password is required').notEmpty();
req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

let errors = req.validationErrors();

if(errors){
    res.render('/register',{
        errors:errors
    });
}else{
    let newUser = new User({
        name:name,
        email:email,
        password:password,
        username:username
    });

    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(newUser.password,salt, function(err,hash){
            if(err){
                console.log(err);
            }
            newUser.password = hash;
            newUser.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    req.flash('success','You are now registered and can now log in');
                    res.redirect('/users/login');
                }
            })
        });
    });
}
});

// Login Form
router.get('/login',function(req,res,){
    res.render('login');
});

// Login Process
router.post('/login',function(req,res,next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req,res,next);
});

// Logout
router.get('/logout',function(req,res){
    req.logout();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
})

module.exports = router;