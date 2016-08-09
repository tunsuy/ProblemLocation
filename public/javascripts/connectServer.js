var Client = require('ssh2').Client;
var cmdData = "";
function connServer(serverIP,cmd){
    var conn = new Client();
    conn.on('ready', function() {
        // console.log('Client :: ready');
        conn.exec(cmd, function(err, stream) {
            if (err) throw err;
            stream.on('close', function(err, stream) {
                // console.log('Stream :: close');
                conn.end();
            }).on('data', function(data) {
                cmdData += data.toString();
                console.log('命令行输出------------');
                console.log("命令"+cmdData);

                // console.log('STDOUT: ' + data);
            }).stderr.on('data', function(data) {
                // console.log('STDERR: ' + data);
            });
            // stream.end(cmd);

        });
    }).connect({
        host: serverIP,
        port: 22,
        username: 'root',
        password: 'moatest'
       // privateKey: require('fs').readFileSync('/here/is/my/key')
    });
    console.log("返回data:"+cmdData);
    return cmdData; 
}

exports.connServer = connServer;