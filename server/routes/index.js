var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('visiter on /');
  res.render('index', { title: 'tick-tack-toe' });
});

module.exports = router;
