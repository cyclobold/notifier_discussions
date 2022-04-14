var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require("dotenv");
const mongodb = require("mongodb");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const cors = require("cors");
dotenv.config();

const MongoClient = mongodb.MongoClient;

const connection_ = new MongoClient(process.env.DB_HOST);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const servicesRouter = require("./routes/services");

var app = express();

app.use(express.json());
app.use(cors());
//app.use(flash());
app.use(session({
  secret: "1234",
  saveUninitialized: false,
  resave: false
}))

app.post("/create-note", function(request, response){

  //

    response.send({
      message: "Creating Note"
    })
})


app.post("/logout", function(request, response){

  request.session.destroy(function(error){
    if(error){
      console.log(error);
    }

  
  })


})




//Login
app.post("/login-user", function(request, response){
    username = request.body.username;
    password = request.body.password;

    connection_.connect().then(async (feedback) =>{
        if(feedback){
            user = await connection_.db(process.env.DB_NAME).collection("notifier_users").findOne({username: username});

            if(user){
              //the user exists
              const check_password = await bcrypt.compare(password, user.password);
              

              if(check_password){
                login_user_result = await connection_.db(process.env.DB_NAME).collection("notifier_users").updateOne({username: username}, {$set: {is_logged_in: true }})

                request.session.user = user;

    
                response.send({
                  message: "User exists",
                  data: null,
                  code: "success"
                })


              }else{
                response.send({
                  message: "Invalid Password for this user",
                  data: null,
                  code: "error"
                })

              }

        



          

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

  //hash the password
  //password = crypto.createHash("sha256", password).update("engage").digest('hex');


  connection_.connect().then( async(feedback) => {

    // const salt = await bcrypt.genSalt();
    // password = await bcrypt.hash(password, salt);

    const salt = await bcrypt.genSalt();
    hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed Pass: ", hashedPassword);

    result = await connection_.db(process.env.DB_NAME).collection("notifier_users").insertOne({
      fullname: fullname,
      username: username,
      password: hashedPassword,
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
