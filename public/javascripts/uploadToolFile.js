
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

var cmd = "echo " + "'" + pushTool + "'" + " > ./push.py ; echo " + "'"
        + workattendanceTool + "'" + " > ./workattendance.py ; echo "+"'"
        +workFlowedTool+"'"+" > ./workFlowed.py ; echo "+"'"+taskTool+"'"
        +" > ./task.py ; echo "+"'"+imTool+"'"+" > ./im.py ; echo "+"'"
        +workReportTool+"'"+" > ./workReport.py ; echo "+"'"
        +customerTool+"'"+" > ./customer.py ; echo "+"'"
        +cloudDiskTool+"'"+" > ./cloudDisk.py ; echo "+"'"
        +privilegeTool+"'"+" > ./privilege.py ; echo "+"'"
        +webappTool+"'"+" > ./webapp.py ; echo "+"'"
        +legworkTool+"'"+" > ./legwork.py"

var Client = require('ssh2').Client;
var conn = new Client();
// Object.freeze(conn)

function uploadFile(reqServerIP, reqUserName, reqPwd, alyFlag){
   
    // var reqServerIP = req.body['serverIP'];
    // var reqUserName = req.body['userName'];
    // var reqPwd = req.body['pwd'];
    
    console.log("上传服务器命令："+cmd);
    console.log("请求的ip、用户名、密码："+reqServerIP+"、"+reqUserName+"、"+reqPwd);

    conn.on('ready', function() {
        conn.exec(cmd, function(err, stream) {
            if (err) throw err;
            stream.on('close', function(err, stream) {
                conn.end();
                // if (alyFlag == "aly") {
                //     conn.on('ready', function() {
                //         conn.exec(cmd, function(err, stream) {
                //             if (err) throw err;
                //             stream.on('close', function(err, stream) {
                //                 conn.end();
                //                 conn.on('ready', function() {
                //                     conn.exec(cmd, function(err, stream) {
                //                         if (err) throw err;
                //                         stream.on('close', function(err, stream) {
                //                             conn.end();                
                //                         }).on('data', function(data) {
                                            
                //                             console.log('DATA: '+data);
                                            
                //                         }).stderr.on('data', function(data) {
                //                             console.log('STDERR: ' + data);
                //                         });

                //                     });
                //                 }).connect({
                //                     host: "115.29.98.162",
                //                     port: 22,
                //                     username: "frontground",
                //                     password: "873b9673fdb5f532"
                //                 });
                                              
                //             }).on('data', function(data) {
                                
                //                 console.log('DATA: '+data);
                                
                //             }).stderr.on('data', function(data) {
                //                 console.log('STDERR: ' + data);
                //             });

                //         });
                //     }).connect({
                //         host: "121.42.193.51",
                //         port: 22,
                //         username: "background",
                //         password: "c7C02Ff079cCfB3aEe4c"
                //     });
                // }                                     
            }).on('data', function(data) {
                
                console.log('DATA: '+data);
                
            }).stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });

        });
    }).connect({
        host: reqServerIP,
        port: 22,
        username: reqUserName,
        password: reqPwd
    });
}

exports.uploadFile = uploadFile;