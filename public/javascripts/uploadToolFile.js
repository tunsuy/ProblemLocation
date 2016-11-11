
var LoggerHelper = require("../../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('uploadToolFile.js');

//读取工具脚本文件
var rf=require("fs");
var pushTool=rf.readFileSync("server_tools/push.py","utf-8");
var workattendanceTool=rf.readFileSync("server_tools/workattendance.py","utf-8");
var workFlowedTool = rf.readFileSync("server_tools/workFlowed.py", "utf-8");
var taskTool = rf.readFileSync("server_tools/task.py", "utf-8");
var imTool = rf.readFileSync("server_tools/im.py", "utf-8");
var workReportTool = rf.readFileSync("server_tools/workReport.py", "utf-8");
var customerTool = rf.readFileSync("server_tools/customer.py", "utf-8");
var cloudDiskTool = rf.readFileSync("server_tools/cloudDisk.py", "utf-8");
var privilegeTool = rf.readFileSync("server_tools/privilege.py", "utf-8");
var webappTool = rf.readFileSync("server_tools/webapp.py", "utf-8");
var legworkTool = rf.readFileSync("server_tools/legwork.py", "utf-8");

var globalDefined = require("../../models/commons/globalDefined.js");
var macro = globalDefined.macro;

//创建目录并在当前目录下创建工具脚本
var uploadFileCMD = "mkdir -p " + macro.SERV_TOOL_DIR
        + "; cd " + macro.SERV_TOOL_DIR 
        + "; echo " + "'" + pushTool + "'" + " > ./push.py ; echo " + "'"
        + workattendanceTool + "'" + " > ./workattendance.py ; echo "+"'"
        +workFlowedTool+"'"+" > ./workFlowed.py ; echo "+"'"+taskTool+"'"
        +" > ./task.py ; echo "+"'"+imTool+"'"+" > ./im.py ; echo "+"'"
        +workReportTool+"'"+" > ./workReport.py ; echo "+"'"
        +customerTool+"'"+" > ./customer.py ; echo "+"'"
        +cloudDiskTool+"'"+" > ./cloudDisk.py ; echo "+"'"
        +privilegeTool+"'"+" > ./privilege.py ; echo "+"'"
        +webappTool+"'"+" > ./webapp.py ; echo "+"'"
        +legworkTool+"'"+" > ./legwork.py; echo 'done!'";

//XML文件处理
var xmlDataHandler = require("./xmlDataHandler.js");

var dbsecServerInfo = xmlDataHandler.getServerInfo("dbsecAccountInfo");
var dbServerInfo = xmlDataHandler.getServerInfo("dbAccountInfo");
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

//引入核心操作类文件
var coreOperate = require("../../models/coreData/helpClass/coreOperate.js");

//实例化核心操作类
var moduleInfo = new coreOperate.Info();

var async = require('async');

function execUploadFileCMD(data, conn, callback) {
    loggerHelper.writeInfo("登录正确！！！！！！！！");
    loggerHelper.writeInfo("开始执行uploadFile:------");
    return moduleInfo.connExec(conn, uploadFileCMD, callback);
}

//输出内容到view层
function putoutToView(req, res, rdView) {
    loggerHelper.writeInfo("输出内容到view层...");
    res.render(rdView, { 
        modelsAttributes: modelsAttributesData, 
        modelsPropertys: modelsPropertysData, 
        serverIP: req.session.reqServerIP
    });
}

//使用async处理异步回调
function asyncHandler(callbackArr, req, res, rdView) {
    // var self = this; //保存当前上下文，用于下面的function调用
    async.waterfall(callbackArr, function(err, result) {
        loggerHelper.writeInfo("开始执行async最后的回调处理...");
        if (err) {
            loggerHelper.writeErr("err: "+err);
            putoutToView(req, res, '/');
            return;
        }
        putoutToView(req, res, rdView);
        return;
    });
}

function uploadFile(conn, req, res){ 
    loggerHelper.writeInfo("开始验证是否登录成功");

    //Async库waterfall中的方法组，如果没有输出任何data，则会一直不回调
    //故在执行检测命令的时候需要任意的输出一点数据；
    var checkCMD = "echo checking...";

    callbackArr = [
        function(callback) {
            loggerHelper.writeInfo("执行任意一个命令来验证");
            return moduleInfo.connExec(conn, checkCMD, callback);
        },
        moduleInfo.streamOpr,
        function(data, callback) {
            return execUploadFileCMD(data, conn, callback);
        },
        moduleInfo.streamOpr
    ];
        
    asyncHandler(callbackArr, req, res, "index.ejs");

}

function toAly(req, res) {
    var ssh2 = require('ssh2');
    var Client = ssh2.Client;
    var alyConn = new Client();
    alyConn.on('ready', function() {
        loggerHelper.writeInfo("aly 连接成功...");
        uploadFile(alyConn, req, res);
    }).connect({
        host: dbServerInfo.ip,
        port: 22,
        username: dbServerInfo.userName,
        password: dbServerInfo.passWord
    });
}

function toNomal(req, res) {
    req.session.conn.on('ready', function() {
        loggerHelper.writeInfo("服务器连接成功...");
        uploadFile(req.session.conn, req, res);
    }).connect({
        host: req.session.reqServerIP,
        port: 22,
        username: req.session.reqUserName,
        password: req.session.reqPwd
    });
}

exports.toNomal = toNomal;
exports.toAly = toAly;

