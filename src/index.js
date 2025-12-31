const express = require('express');
const bodyParser = require('body-parser');
const {PORT} = require('./config/serverConfig');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const setupAndStartServer = async () => {

    const app = express();
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use('/api',apiRoutes);

    if(process.env.DB_SYNC)
    {
        db.sequelize.sync({alter:true});
    }
    
    app.listen(PORT , async () => {
        console.log("Server started on PORT : ",PORT);
    })

}

setupAndStartServer();