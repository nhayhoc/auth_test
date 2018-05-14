
const express = require('express');
var User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/main');
const crypto = require('crypto');// Encrypt



exports.login = function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    User.login(email,password, (err, message)=>{
        if (err) { return next(err); }
        if (!message.success) {
            return res.status(401).json(message);
        }
        res.status(200).json(message);
    })
};
exports.register = function(req, res, next) {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    var resRegister = User.register(email, password, lastName, firstName, (err, message)=> {
        if (err) { return next(err); }
        if (message.success===false){
            return res.status(422).json(message);
        }
        return res.status(200).json(message);
    });
};
exports.verify = function(req, res, next) {
    const token = req.params.token;
    User.verify(token, (err, success)=>{
        if (err) { return next(err); }
        if (success) {
            return res.status(200).json({ message: 'Verified email successfully, you can login with this emai.' });
        }
        res.status(422).json({ message: 'Your token has expired. Please attempt to reset your password again.' });
    });
};
exports.resendVerify = function(req,res,next) {
    const email = req.params.email;
    User.resendVerify(email, (err, token)=>{
        if (err) { return next(err); }
        if (!token) {
            return res.status(422).json({error: "Your request could not be processed as enterted. Please try again!"});
        }
        return res.status(200).json({success: true, message: 'Successfully send link verify. Your token: '+token})
    })
    
};
exports.forgotPassword = function(req, res, next) {
    const email = req.body.email;

    User.forgotPassword(email, (err, message)=>{
        if (err) { return next(err); }
        if (!message) { return res.status(422).json({error: "Email not found. Please try again!"}); }
        res.status(200).json({token: message})
    });

    
}
exports.resetPassword =  function(req,res,next){
    const token = req.params.token;
    const password = req.body.password;
    User.resetPassword(token, password, (err, success)=>{
        console.log("token: " + token);
        if (err) { return next(err); }
        if (!success) {
            return res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
        }
        return res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
    });
};