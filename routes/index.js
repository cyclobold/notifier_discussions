var express = require('express');
const dotenv = require("dotenv");
var helpers = require('handlebars-helpers');
const mongodb = require("mongodb");
var comparison = helpers.comparison();
var router = express.Router();
dotenv.config();
const MongoClient = mongodb.MongoClient;

const connection_ = new MongoClient(process.env.DB_HOST);

/* GET home page. */
router.get('/', async function(req, res, next) {

const checkConnection = await connection_.connect();

let isUserLoggedIn = false;

if(typeof req.session.user != 'undefined'){
  if(req.session.user.is_logged_in == true){
    isUserLoggedIn = true;
  }

}


let notes = [];
if(checkConnection){
  notes = await connection_.db(process.env.DB_NAME).collection("notes").find().toArray();

  if(notes.length != 0){
    for(let i = 0; i < notes.length; i++){
        date = new Date(notes[i].meta.date_created);

        notes[i].meta.year = date.getFullYear();
        notes[i].meta.month = date.getMonth();
        notes[i].meta.day = date.getDay();
        notes[i].meta.minutes = date.getMinutes();
        notes[i].meta.hours = date.getHours();
    }
  }


  console.log(notes);
  res.render('index', { 
    isUserLoggedIn: isUserLoggedIn,
    notes: notes
 });


}
 
  
});

module.exports = router;
