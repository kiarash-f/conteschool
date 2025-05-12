const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const coursesRoute = require('./routes/coursesRoute');
const userRoute = require('./routes/userRoute');


const app = express();



// app.use(cors());


app.use(morgan('dev'));


// app.use(express.json());

//*************** Routes ****************/
app.use("/api/v1/courses", coursesRoute);
app.use("/api/v1/users", userRoute);







module.exports = app;





