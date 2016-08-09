
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");

var express = require('express');
var router = express.Router();
var reqServerIP = "";

var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

router.get('/', function(req, res, next) {

	// var reqServerIP = req.query.id;
	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
	console.log("登录的服务器为："+global.reqServerIP);
	if (global.reqServerIP) {
		res.render('loginRelate.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
	}else{
		res.redirect('/');
	}
		// }
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {
	var reqServerIP = req.query.id;
	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
		res.render('loginRelate.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: reqServerIP, account: "", content: ""});
	// }
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});



module.exports = router;
