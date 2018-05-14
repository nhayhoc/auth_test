var express = require('express');
app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/main');
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var port = 3000;
const crypto = require('crypto');// Encrypt
const AuthenticationController = require('./controllers/authentication');


//use body-parser to get post requests for API use
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(passport.initialize());

//Log requests to console
app.use(morgan('dev'));

//Connect to db
mongoose.connect(config.database);


(async function() {
    const email = "ducdeptrai2@gmail.com";
    var foundUser = await User.findOne({email});
    var resetToken = await randomBytePromise();
    console.log(resetToken);
    var isMatch = await comparePasswordPromise(foundUser,"anhyeuem");
    console.log("is match: " + isMatch);
})();

var comparePasswordPromise = function(user,password){
    return new Promise((res,rej)=>{
        user.comparePassword(password, function (err, isMatch) {
            if (err) { rej(err); }
            res(isMatch);
        });
    });
}
var randomBytePromise = function(){
    return new Promise((res,rej)=>{
        crypto.randomBytes(48, (err,beffer) => {
            var resetToken = beffer.toString('hex');
            if (err) { rej(err); }
            res(resetToken)
        });
    });
}
