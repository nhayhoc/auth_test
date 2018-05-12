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

// Bring in passport
require('./config/passport')(passport);

// Create API group routes
var apiRoutes = express.Router();

//Register new users return verify link
apiRoutes.post('/register', AuthenticationController.register);

//Verify email 
apiRoutes.get('/register/verify/:token', AuthenticationController.verify);

//Resend verify email 
apiRoutes.get('/register/verify/resend/:email', AuthenticationController.resendVerify);

// Authenticate the user and get a JWT
apiRoutes.post('/authenticate', AuthenticationController.login);

//forgot password
apiRoutes.post('/forgot-password', AuthenticationController.forgotPassword);

//reset password
apiRoutes.post('/reset-password/:token',AuthenticationController.resetPassword);

//Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt',{session: false}), function (req,res){
    res.send('It worked! User id is: ' + req.user._id + '.');
});

//set url for api group routes
app.use('/api', apiRoutes);

//Hoem route
app.get('/', (req,res)=>{
    res.send('Duc Master ahihi');
});
app.listen(port);
console.log(`Your server is running on port ${port}`);