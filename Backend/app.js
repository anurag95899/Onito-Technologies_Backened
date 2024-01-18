const express = require('express');
const app = express();
const logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config()
const {pool }= require('./Config/database.js')


const PORT = process.env.PORT||3000;
const userRouter = require('./Routes/index.js')
app.use(logger('tiny'));

app.use(express.json());
app.use(express.urlencoded({extended:false}))

pool.getConnection((err, connection) => {
  if (err) {
      console.error('Error connecting to MySQL database:', err);
      process.exit(1); 
  } else {
      console.log('Connected to MySQL database');
      connection.release();
  }
}); 

app.use('/Backend/index', userRouter);

app.listen(PORT,() => {
    console.log(`Congratulation Your Server Is Runing on ${PORT}......`);
  });
   
