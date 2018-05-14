const crypto = require('crypto');// Encrypt
exports.TokenGenerator = function(cb){
    crypto.randomBytes(48, (err, beffer)=>{
        if (err) { return cb(err); }
        var resetPasswordToken = beffer.toString('hex');;
        var resetPasswordExpires=Date.now() + 3600000; //1 hour
        cb(null,resetPasswordToken,resetPasswordExpires);
    });
}