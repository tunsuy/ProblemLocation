function Info() {

};

Info.prototype.connExec = function(conn, CMD, callback) {
	conn.exec(CMD, function(err, stream){
		if (err) {return callback(err, null);}
		return callback(null, stream);
	});
};

Info.prototype.streamOpr = function(stream, callback) {
	stream.on('close', function(err, stream){
		if (err) {return callback(err, null);}
	}).on('data', function(data){
		return callback(null, data);
	}).stderr.on('data', function(data) {
        return callback(data, null);
    });
}

exports.Info = Info;