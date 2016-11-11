var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	// var session = req.session;
	// console.log("session: "+session);
	// var obj = session.obj?session.obj:"";
	if (req.session.conn) {
		req.session.conn.end();
	}
  	res.render('login.ejs', { errInfo: "" });
});

module.exports = router;
