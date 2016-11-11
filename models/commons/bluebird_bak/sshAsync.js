
var Callback = {
	createNew: function(){
		var callback = {};
		callback.connExec = function(contentCmd){
			return global.conn.exec(contentCmd);
		};
		callback.execAsync = function(err, stream){
			if (err) throw err;
            return stream.on('close', function(err, stream) {
            	if (didStr == "" || didStr == null) {
            		// global.conn.end();
            	}
                // conn.end();
            }).on('data');
		};
		callback.stderrAsync = function(data){
			console.log("call stderrAsync fun...");
		};
		callback.streamErrAsync = function(stream){
			console.log("call streamErrAsync fun...");
		};

		return callback;
	}
};

exports.Callback = Callback;