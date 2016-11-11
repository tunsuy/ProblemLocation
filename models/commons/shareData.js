function UserInfo() {

}

UserInfo.prototype.connExec = function(req, conn, userOprInfo, CMD, callback) {
	conn.exec(CMD, function(err, stream){
		if (err) {return callback(err, null);}
		return callback(null, req, userOprInfo, stream);
	});
}

UserInfo.prototype.streamOpr = function(req, userOprInfo, stream, callback) {
	stream.on('close', function(err, stream) {
		if (err) {return callback(err, null);}
	}).on('data', function(data) {
		return callback(null, req, userOprInfo, data);
	}).stderr.on('data', function(data) {
        return callback(data, null);
    });
}

UserInfo.prototype.getBase = function(req, userOprInfo, data, callback) {
	var didStr = (/did=(\d+)/).exec(data);
    var pidStr = (/pid=(\d+)/).exec(data);
    if (didStr == "" || didStr == null) {
        return callback(data, null);
    }
    var info = {did: "", pid: ""};
	info.did = didStr[1];
	info.pid = pidStr[1];
	console.dir("userBaseInfo: "+info);

	return callback(null, req, userOprInfo, info);
}

exports.UserInfo = UserInfo;
