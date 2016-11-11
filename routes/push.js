var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('push.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");

var globalDefined = require("../models/commons/globalDefined.js");
var macro = globalDefined.macro;

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
	loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
	routerGet.renderView(req, res, "push.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;
var moduleInfo = commonHandler.moduleInfo;

//获取XML文档数据
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();

//获取下一步操作的命令
var nextCMDFromUserInfo = function(req, userOprInfo, userBaseInfo, callback) {
	var pushMsgCount, pushUserEventCount;
	for (var index=0; index<modelsPropertysData.length; index++){
		if (modelsPropertysData[index][0].firstChild.data == "推送") {
			pushMsgCount = modelsPropertysData[index][1].firstChild.data;
			pushUserEventCount = modelsPropertysData[index][2].firstChild.data;
			break;
		};
	}

	var pushServerFlag = (userOprInfo.get().reqPushServer == "on")?1:0;
	var userSettingFlag = (userOprInfo.get().reqUserSetting == "on")?1:0;
	pushMsgCount = (userOprInfo.get().reqPushMsg == "on")?pushMsgCount:0;
	pushUserEventCount = (userOprInfo.get().reqLoginInfo == "on")?pushUserEventCount:0;

	var nextCMD = "cd " + macro.SERV_TOOL_DIR + 
		"; python push.py "+userBaseInfo.pid+" "+pushServerFlag+
		" "+userSettingFlag+" "+pushMsgCount+" "+pushUserEventCount;
	loggerHelper.writeInfo("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(req, nextCMD, callback);
}

router.post('/', function(req, res, next) {
	var reqAccount = req.body['account'];
	var reqPushServer = req.body['pushServer'];
	var reqUserSetting = req.body['userSetting'];
	var reqPushMsg = req.body['pushMsg'];
	var reqLoginInfo = req.body['loginInfo'];
	
	//实例化用户操作类
	var userOprInfo = new shareModels.UserOprInfo();
	userOprInfo.set({
		reqAccount: reqAccount,
		reqPushServer: reqPushServer,
		reqUserSetting: reqUserSetting,
		reqPushMsg: reqPushMsg,
		reqLoginInfo: reqLoginInfo
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
			moduleInfo.streamOpr
		];

		collectData.alyAsyncHandler(userOprInfo, callbackArr, req, res, "push.ejs");
	}
	else if (!req.session.conn) {
		res.redirect('/');
	}
	else {
		//针对普通服务器
		callbackArr = [
			function(callback) {
				collectData.firstCMD(req, userOprInfo, callback);
			},
			userInfo.streamOpr,
			collectData.addUserInfo,
			userInfo.getBase,
			nextCMDFromUserInfo,
			moduleInfo.connExec,
			moduleInfo.streamOpr
		];
		
		collectData.asyncHandler(userOprInfo, callbackArr, req, res, "push.ejs");
	}

});

module.exports = router;
