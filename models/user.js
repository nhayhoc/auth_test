var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// Chema
var UserChema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required:true
    },
    password: {
        type: String,
        required: true 
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
        required: true
    },
    lastName: {
        type: String,
        required: true
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
module.exports = mongoose.model('User',UserChema);