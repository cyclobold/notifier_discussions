var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', {
    pageName: "Cyclobold",
    pageNumber: 1,
    userDetails: {
        name: "James",
        age: 12,
        id: 123
    }
  });
});

module.exports = router;
