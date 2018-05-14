var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/main');

var {emailValidator,pwdValidator,first_lastName} = require('./validate');
var {TokenGenerator} = require('../../helper/TokenGenerator');
// Chema
var UserChema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required:true,
        validate: emailValidator
    },
    password: {
        type: String,
        required: true,
        validate: pwdValidator 
    },
    role: {
        type: String,
        enum: ['Client','Manager','Admin'],
        default: 'Client'
    },
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: String},
    verify: {
        type:Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true,
        validate: first_lastName
    },
    lastName: {
        type: String,
        required: true,
        validate: first_lastName
    }
}, {
    timestamps: true
});

//save the user's hashed password
UserChema.pre('save', function(next){
    var user = this;
    if(this.isModified('password') || this.isNew){
        bcrypt.genSalt(10,function(err,salt){
            if(err){
                return next(err);
            }
            bcrypt.hash(user.password, salt, function(err,hash){
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            })
        })
    } else {
        return next();
    }
});

// Create method to compare password
UserChema.methods.comparePassword = function(pw,cb){
    bcrypt.compare(pw,this.password, function(err,isMatch){
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserChema);
const User = mongoose.model('User', UserChema);

// Method
module.exports.register = function(email, password, firstName, lastName, cb){
    User.findOne({email}, (err, existingUser) => {
        if (err) {  return cb(err); }
        if (existingUser) {
            return cb(null,{success: false, message: [{field: "email", message: "That email address is already is use."}]});
        }
        TokenGenerator((err, resetPasswordToken,resetPasswordExpires)=>{
            if (err) { return cb(err); }
            var newUser = new User({email, password, firstName, lastName, resetPasswordToken, resetPasswordExpires});
            newUser.save(function(err){
                if (err) {
                    var validationError = [];
                    if (err.name == 'ValidationError') {
                        for (field in err.errors) {
                            validationError.push({field: field, message: err.errors[field].message});
                        }
                    }
                    return cb(null, {success: false, message: validationError});
                }
                // var linkverify = `http://${req.headers.host}/api/register/verify/${resetToken}`;
                cb(null,{success: true, message: resetPasswordToken});
            });
        });
    }); 
}
module.exports.login = function(email, password, cb) {
    
    User.findOne({email}, function (err,user) { //callback1
        if (err) { return cb(err); }
        if (!user){
            return cb(null,{success: false, message: 'Authentication failed. Email not found. '});
        } 

        // check password
        user.comparePassword(password, function (err, isMath) {//cacllback2
            if (err) { return cb(err); }
            if (!user.verify){
                return cb(null,{success: false, message: `Please verify that email!`});
            } 
            if (isMath) {
                //create the token
                var token = jwt.sign(JSON.parse(JSON.stringify(user)),config.secret, {
                    expiresIn: 10080 //in seconds
                });
                return cb(null,{success: true, token: 'JWT ' + token});    
            } 
            return cb(null, {success: false, message: 'Authentication failed. Password did not match. '});
            
        });
        
    });
}
module.exports.verify = function(token, cb) {
    User.findOneAndUpdate({ resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now() } }, {verify: true}, (err, doc)=>{
        if (err) { return cb(err); }
        return cb(null, !!doc)
    });
}
module.exports.resendVerify = function(email, cb){
    TokenGenerator((err, newResetPasswordToken,resetPasswordExpires)=>{
        if (err) { return cb(err); }
        User.findOne({email: email, verify: false}, (err, foundUser)=>{
            if (err) { return cb(err); }
            if (!foundUser) { return cb(null, false); }
            if(!foundUser.resetPasswordToken) { //Nếu resetToken == null
                foundUser.resetPasswordToken = newResetPasswordToken;
            }
            foundUser.resetPasswordExpires = resetPasswordExpires;
            foundUser.save({ validateBeforeSave: false },(err)=>{
                if (err) { return cb(err); }
                return cb(null, foundUser.resetPasswordToken);
            });
        });
    });
}
module.exports.forgotPassword = function(email, cb){
    TokenGenerator((err, resetPasswordToken, resetPasswordExpires)=>{
        User.findOne({email}, (err, foundUser)=>{
            if (err) { return cb(err); }
            if (!foundUser) { return cb(null, false); }
            foundUser.resetPasswordToken = resetPasswordToken;
            foundUser.resetPasswordExpires = resetPasswordExpires;
            foundUser.save({ validateBeforeSave: false }, (err)=>{
                if (err) { return cb(err); }
                return cb(null, foundUser.resetPasswordToken);
            });
        });
    });
}
module.exports.resetPassword = function(token, password, cb){
    User.findOne({resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now()} }, (err,foundUser)=>{
        if (err) { return cb(err); }
        if (!foundUser) { return cb(null, false); }
        console.log(password);
        foundUser.password = password;
        foundUser.resetPasswordToken = null;
        foundUser.resetPasswordExpires = null;
        foundUser.save((err)=>{
            if (err) { return cb(err); }
            cb(null, true);
        })
    })
}
