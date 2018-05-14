var express = require('express');

module.exports = (app)=>{

    // Create API group routes
    var apiRoutes = express.Router();
    var authRoutes = express.Router();


    
    //call Routers
    require('./authRoutes')(authRoutes);




    //set url for api group routes
    app.use('/api/v1/', apiRoutes);
    apiRoutes.use('/auth', authRoutes);

}
