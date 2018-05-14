const User = require('../models/User');
const AuthenticationController = require('../controllers/authentication');

module.exports = function(authRoutes){

    //Register new users return verify link
    authRoutes.post('/register', AuthenticationController.register);

    //Verify email 
    authRoutes.get('/register/verify/:token', AuthenticationController.verify);

    //Resend verify email 
    authRoutes.get('/register/verify/resend/:email', AuthenticationController.resendVerify);

    // Authenticate the user and get a JWT
    authRoutes.post('/login', AuthenticationController.login);

    //forgot password
    authRoutes.post('/forgot-password', AuthenticationController.forgotPassword);

    //reset password
    authRoutes.post('/reset-password/:token',AuthenticationController.resetPassword);

}