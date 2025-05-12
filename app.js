const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const coursesRoute = require('./routes/coursesRoute');
const userRoute = require('./routes/userRoute');
const newsRoute = require('./routes/newsRoute');
const studentWorkRoute = require('./routes/studentWorkRoute');


const app = express();



// app.use(cors());


app.use(morgan('dev'));


// app.use(express.json());

//*************** Routes ****************/
app.use("/api/v1/courses", coursesRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/news", newsRoute);
app.use("/api/v1/studentWorks", studentWorkRoute);







module.exports = app;





