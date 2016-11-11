var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('customer.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var coreOpr = require("../models/coreData/helpClass/coreOperate.js");

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
	loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
	routerGet.renderView(req, res, "customer.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

//获取下一步操作的命令
var nextCMDFromUserInfo = function(req, userOprInfo, userBaseInfo, callback) {
	var customerAttrFlag = (userOprInfo.get().reqCustomerAttrFlag == "on")?1:0;
    var customerLabelFlag = (userOprInfo.get().reqCustomerLabelFlag == "on")?1:0;
    var customerExportFlag = (userOprInfo.get().reqCustomerExportFlag == "on")?1:0;

	var nextCMD = "python customer.py "+userBaseInfo.did+" "+
		userOprInfo.reqCustomerName+" "+customerAttrFlag+" "+
		customerLabelFlag+" "+customerExportFlag;

	loggerHelper.writeInfo("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(req, nextCMD, callback);
}

router.post('/', function(req, res, next) {
	var reqAccount = req.body['account'];
	var reqCustomerName = req.body['customerName'];
	var reqCustomerAttrFlag = req.body['customerAttrFlag'];
	var reqCustomerLabelFlag = req.body['customerLabelFlag'];
	var reqCustomerExportFlag = req.body['customerExportFlag'];

	//实例化用户操作类
	var userOprInfo = new shareModels.UserOprInfo();
	userOprInfo.set({
		reqAccount: reqAccount,
		reqCustomerName: reqCustomerName,
		reqCustomerAttrFlag: reqCustomerAttrFlag,
		reqCustomerLabelFlag: reqCustomerLabelFlag,
		reqCustomerExportFlag: reqCustomerExportFlag
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

		collectData.alyAsyncHandler(userOprInfo, callbackArr, req, res, "customer.ejs");
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
			moduleInfo.streamOpr
		];
		
		asyncHandler(userOprInfo, callbackArr, req, res, "customer.ejs");
	}

});

module.exports = router;
