
var Promise = require('bluebird');

var Callback = {
	createNew: function(){
		var callback = {};
		callback.execAsync = function(stream){
			// promise.promisifyAll(stream);
			// return new Promise(function (resolve){
			// 	resolve(stream.onAsync('data'));
			// });
			// return stream.onAsync('data');
			return Promise.resolve(stream.onAsync('data'));
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