var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('workFlowed.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var coreOpr = require("../models/coreData/helpClass/coreOperate.js");

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
    loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
    routerGet.renderView(req, res, "workFlowed.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

//获取XML文档数据
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();

//获取下一步操作的命令
var nextCMDFromUserInfo = function(req, userOprInfo, userBaseInfo, callback) {
    var progressIP, applyingNum, rejectedNum, handlingNum, 
        handledNum, copymeNum, userAccount, password;

    for (var index=0; index<modelsPropertysData.length; index++){
        if (modelsPropertysData[index][0].firstChild.data == "流程") {
            progressIP = modelsPropertysData[index][1].firstChild.data;
            applyingNum = modelsPropertysData[index][2].firstChild.data;
            rejectedNum = modelsPropertysData[index][3].firstChild.data;
            handlingNum = modelsPropertysData[index][4].firstChild.data;
            handledNum = modelsPropertysData[index][5].firstChild.data;
            copymeNum = modelsPropertysData[index][6].firstChild.data;
            userAccount = modelsPropertysData[index][7].firstChild.data;
            password = modelsPropertysData[index][8].firstChild.data;
            break;
        };
    }
    
    applyingNum = (userOprInfo.get().applying == "on")?applyingNum:0;
    rejectedNum = (userOprInfo.get().rejected == "on")?rejectedNum:0;
    handlingNum = (userOprInfo.get().handling == "on")?handlingNum:0;
    handledNum = (userOprInfo.get().handled == "on")?handledNum:0;
    copymeNum = (userOprInfo.get().copyme = "on")?copymeNum:0;

    loggerHelper.writeInfo(progressIP);

    if (progressIP != "0") {
        var nextCMD = "python workFlowed.py "+userAccount+" "+password+" "+
            userBaseInfo.pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+
            " "+handledNum+" "+copymeNum+" "+progressIP;
    }else{
        var nextCMD = "python workFlowed.py "+userAccount+" "+password+" "+
            userBaseInfo.pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+
            " "+handledNum+" "+copymeNum;
    }

    loggerHelper.writeInfo("nextCMD: "+nextCMD);

    collectData.cbNextCMDFromUserInfo(req, nextCMD, callback);
}

router.post('/', function(req, res, next) {
	var reqAccount = req.body['account'];
    var applying = req.body['applying'];
    var rejected = req.body['rejected'];
    var handling = req.body['handling'];
    var handled = req.body['handled'];
    var copyme = req.body['copyme'];

    //实例化用户操作类
    var userOprInfo = new shareModels.UserOprInfo();
    userOprInfo.set({
        reqAccount: reqAccount,
        applying: applying,
        rejected: rejected,
        handling: handling,
        handled: handled,
        copyme: copyme
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

        collectData.alyAsyncHandler(userOprInfo, callbackArr, req, res, "workFlowed.ejs");
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
            // function(data, callback) {
            //     if (data == null) {
            //         collectData.receiveExtContent("该服务器不支持MysqlDB环境，请联系ts配置");
            //     }
            //     return callback(null, data);
            // }
        ];
        
        asyncHandler(userOprInfo, callbackArr, req, res, "workFlowed.ejs");
    }
    
});


module.exports = router;
