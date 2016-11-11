function Info() {

};

Info.prototype.connExec = function(conn, CMD, callback) {
	console.log("开始执行命令...");
	conn.exec(CMD, function(err, stream){
		if (err) {return callback(err, null);}
		else {return callback(null, stream);}
	});
};

Info.prototype.streamOpr = function(stream, callback) {
	console.log("获取数据流...");
	stream.on('close', function(err, stream){
		if (err) {
			console.log("关闭数据流：",err);
			return callback(err, null);
		}
	}).on('data', function(data){
		console.log("获取的数据：",data);
		return callback(null, data);
	}).stderr.on('data', function(data) {
		console.log("获取数据流失败：", data);
        return callback(data, null);
    });
}

exports.Info = Info;