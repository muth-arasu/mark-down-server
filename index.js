const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const AuthRouter = require('./Api/Auth.js')
const DraftRouter= require('./Api/Store.api.js');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors());


app.use('/',AuthRouter)
app.use('/',DraftRouter)

const start = async () => {
  try {
    await mongoose.connect('mongodb+srv://mutharasuAitReact:sudha1098@logincluster.shb6x9d.mongodb.net/login',);
    console.log('mongoose connected successfully, server listening on port 8080');
  } catch (error) {
    console.log('Error connecting to MongoDB', error);
  }
};

app.listen(8080, start);
