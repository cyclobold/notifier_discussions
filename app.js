var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require("dotenv");
const mongodb = require("mongodb");
const crypto = require("crypto");
dotenv.config();
const MongoClient = mongodb.MongoClient;

const connection_ = new MongoClient(process.env.DB_HOST);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const servicesRouter = require("./routes/services");

var app = express();

app.use(express.json());

app.post("/create-note", function(request, response){

  //

    response.send({
      message: "Creating Note"
    })
})


//Login
app.post("/login-user", function(request, response){
    username = request.body.username;
    password = request.body.password;

    connection_.connect().then(async (feedback) =>{
        if(feedback){
            user = await connection_.db(process.env.DB_NAME).collection("notifier_users").findOne({username: username, password: password});

            if(user){
              //the user exists
              login_user_result = await connection_.db(process.env.DB_NAME).collection("notifier_users").updateOne({username: username}, {$set: {is_logged_in: true }})

    
              response.send({
                message: "User exists",
                data: {
                  login_user_result: login_user_result,
                  is_logged_in: true,
                  user: user
                },
                code: "success"
              })

            }else{
              //the user does not exist
              response.send({
                message: "User does not exist. Have you registered?",
                code: "error"
              })
            }
        }

    })



})


app.post("/register-user", function(request, response){
  fullname = request.body.fullname;
  username = request.body.username;
  password = request.body.password;

  connection_.connect().then( async(feedback) => {

    result = await connection_.db(process.env.DB_NAME).collection("notifier_users").insertOne({
      fullname: fullname,
      username: username,
      password: password,
      is_logged_in: false
    });

    if(result){
        response.send({
          message: "New Account created",
          code: "success"
        })
    }


  })


})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/services", servicesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
