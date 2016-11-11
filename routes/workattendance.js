var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('workattendance.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var coreOpr = require("../models/coreData/helpClass/coreOperate.js");

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
	loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
	routerGet.renderView(req, res, "workattendance.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

var userBaseInfoObj, userOprInfoObj;

//获取XML文档数据
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();

//获取下一步操作的命令
var nextCMDFromUserInfo = function(req, userOprInfo, userBaseInfo, callback) {
	userBaseInfoObj = userBaseInfo;
	userOprInfoObj = userOprInfo.get();
	var nextCMD = "mdbg -p 21120 -o exportdomain "+userBaseInfo.did;
	loggerHelper.writeInfo("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(req, nextCMD, callback);
}

//通过考勤服务ip和端口得到下一步CMD
var nextCMDFromWorkatdAddress = function(data, callback) {
	var txt=((/0x11[\S\s]*?mdbg_port\((\d+)\)/).exec(data.toString()));

    var re1='.*?';	// Non-greedy match on filler
    var re2='((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(?![\\d])';
    var p = new RegExp(re1+re2,["i"]);
  	var m = p.exec(txt[0]);
  	var progressIP;
  	if (m != null)
    {
       progressIP=m[1];
    }
	console.log("progressIP: "+progressIP);

	var workatdPort = txt[1];
	console.log("workatdPort: "+workatdPort);

	var nextCMD = "mdbg -i "+progressIP+" -p "+workatdPort+" -o getpersonrelateid "+
		"'did="+userBaseInfoObj.did+" pid="+userBaseInfoObj.pid+"'";

	console.log("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(nextCMD, callback);

}

//通过考勤id得到下一步CMD
var nextCMDFromWorkatdInfo = function(data, callback) {
	var workatdInfo = (/relate_id=(\d+)/).exec(data.toString());
	if (workatdInfo == "" || workatdInfo == null) {
		collectData.receiveExtContent("该公司没有设置考勤。。。");
        return callback(data, null);
	}
	
	var workatdId = workatdInfo[1];
	console.log("workatdID: "+workatdId);

	var nextCMD = "python workattendance.py "+userBaseInfoObj.did+" "+userBaseInfoObj.pid+
		" "+workatdId+" "+userOprInfoObj.reqStartTime+" "+userOprInfoObj.reqEndTime;

	console.log("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(nextCMD, callback);
}

router.post('/', function(req, res, next) {
	var reqAccount = req.body['account'];
	var reqStartTime = req.body['startTime'];
	var reqEndTime = req.body['endTime'];
	
	//实例化用户操作类
	var userOprInfo = new shareModels.UserOprInfo();
	userOprInfo.set({
		reqAccount: reqAccount,
		reqStartTime: reqStartTime,
		reqEndTime: reqEndTime
	});

	var callbackArr;

	if (req.session.alyFlag == "aly") {
		//针对aly服务器
		callbackArr = [
			function(callback) {
				collectData.firstCMD(req, userOprInfo, callback);
			},
			userInfo.streamOpr,
			collectData.addUserInfo,
			userInfo.getBase,
			nextCMDFromUserInfo,
			collectData.changeServer,
			moduleInfo.streamOpr,
			nextCMDFromWorkatdAddress,
			moduleInfo.connExec,
			moduleInfo.streamOpr,
			nextCMDFromWorkatdInfo,
			moduleInfo.connExec,
			moduleInfo.streamOpr
		];

		collectData.alyAsyncHandler(userOprInfo, callbackArr, req, res, "workattendance.ejs");
	}
	else if (!req.session.conn) {
		res.redirect('/');
	}
	else {
		//针对普通服务器
		callbackArr = [
			function(callback) {
				collectData.firstCMD(userOprInfo, callback);
			},
			userInfo.streamOpr,
			collectData.addUserInfo,
			userInfo.getBase,
			nextCMDFromUserInfo,
			moduleInfo.connExec,
			moduleInfo.streamOpr,
			nextCMDFromWorkatdAddress,
			moduleInfo.connExec,
			moduleInfo.streamOpr,
			nextCMDFromWorkatdInfo,
			moduleInfo.connExec,
			moduleInfo.streamOpr
		];
		
		asyncHandler(userOprInfo, callbackArr, req, res, "workattendance.ejs");
	}
    
});


module.exports = router;
