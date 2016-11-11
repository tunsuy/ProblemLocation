
function moduleInfo(conn, cmd){
	console.log("start exec fetch moduleInfo");
	console.log("conn: "+conn+", cmd: "+cmd);
	conn.exec(cmd, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(err, stream) {
            // conn.end();
        }).on('data', function(data) {		        	
        	var contentData = "\n\n";
        	contentData += data;
        	console.log("contentData: "+contentData);
        	return contentData;
        }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
        });
    });
}

exports.moduleInfo = moduleInfo;