
const express = require('express');
var User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/main');
const crypto = require('crypto');// Encrypt

exports.login = function(req, res, next) {
    User.findOne({email: req.body.email}, function (err,user) { //callback1
        if (err) throw err;
        if (!user){
            res.json({success: false, message: 'Authentication failed. Email not found. '});
        } else {
            // check password
            user.comparePassword(req.body.password, function (err, isMath) {//cacllback2
                if (isMath && !err) {
                    //create the token
                    var token = jwt.sign(JSON.parse(JSON.stringify(user)),config.secret, {
                        expiresIn: 10080 //in seconds
                    });
                    if (user.verify == false){
                        res.json({success: false, message: `Please verify your email: ${user.email}!`});
                    } else {
                        res.json({success: true, token: 'JWT ' + token});    
                    }
                } else {
                    res.json({success: false, message: 'Authentication failed. Password did not match. '});
                }
            });
        }
    });
};

exports.register = function(req, res, next) {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    if(!email || !password || !firstName || !lastName) {
        return res.json({success: false, message: "Please enter an email, password, firstname and lastname"});
    } 
    User.findOne({email}, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            return res.json({success: false, message: "That email address is already is use."});
        }
        crypto.randomBytes(48, (err, beffer)=>{
            var resetToken = beffer.toString('hex');
            if (err) { return next(err); }
            
            var newUser = new User({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                resetPasswordToken: resetToken,
                resetPasswordExpires: Date.now() + 3600000 //1 hour
            });
    
            newUser.save(function(err){
                if (err) {
                    return next(err);
                }
                var linkverify = `http://${req.headers.host}/api/register/verify/${resetToken}`;
                res.json({success: true, message: 'Successfully created new user. Please verify: '+linkverify});
            });
        });
    }); 
};

exports.verify = function(req, res, next) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, (err, verifyUser) => {
        if (err || !verifyUser) { 
            res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });

        } else {
            verifyUser.verify = true;
            verifyUser.save((err)=>{
                if (err) {
                    if (err) { return next(err); }
                } else {
                    return res.status(200).json({ message: 'Verified email successfully, you can login with this emai.' });
                }
            });
        }
    });
};

exports.resendVerify = function(req,res,next) {
    const email = req.params.email;
    User.findOne({email}, (err,existingUser)=>{
        if (err || !existingUser) {
            res.status(422).json({error: "Your request could not be processed as enterted. Please try again!"});
            return next(err); 
        }
        if (existingUser.verify == true) {
            return res.status(200).json({error: "That email has been verified!"});
        }
        crypto.randomBytes(48, (err, beffer)=>{
            var resetToken = beffer.toString('hex');
            if (err) { return next(err); }
            //res.send('Your resetToken: ' + resetToken);
            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            existingUser.save(err => {
                //if error in saving token, return it
                if (err) { return next(err); }

                var linkverify = `http://${req.headers.host}/api/register/verify/${resetToken}`;

                res.json({success: true, message: 'Successfully send link verify. Please verify: '+linkverify});
    
            });
        });
    });
    console.log(email);
};

exports.forgotPassword = function(req, res, next) {
    const email = req.body.email;
    //if user not found, return error
    User.findOne({email}, (err, existingUser)=> {//callback1
        if (err || existingUser == null){
            console.log("here");
            res.status(422).json({error: "Your request could not be processed as enterted. Please try again!"});
            return next(err);
        }

        //if user found, generate and save resetToken
        //generate a token with Crypto
        console.log("here 2");
        crypto.randomBytes(48, (err, beffer)=>{//callback2
            var resetToken = beffer.toString('hex');
            if (err) { return next(err); }
            //res.send('Your resetToken: ' + resetToken);
            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            existingUser.save(err => {
                //if error in saving token, return it
                if (err) { return next(err); }

                var linkreset = `http://${req.headers.host}/api/reset-password/${resetToken}`;

                //send mail here
                res.send("Your link reset: " + linkreset);
            })
        })


    });

    

    
}

exports.resetPassword =  function(req,res,next){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()} }, (err, resetUser)=>{
        if(!resetUser || err){
            res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
        }
        
        resetUser.password = req.body.password;
        resetUser.resetPasswordToken = null;
        resetUser.resetPasswordExpires = null;
        resetUser.save((err)=>{
            if (err) { return next(err); }
            return res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
        })
    });
};