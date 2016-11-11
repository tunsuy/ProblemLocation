var CommonInfo = {
	createNew: function(){
		var commonInfo = {};
		commonInfo.userInfo = function(data){
			didStr = (/did=(\d+)/).exec(data);
            pidStr = (/pid=(\d+)/).exec(data);
            if (didStr == "" || didStr == null) {
                return ({
                	"did": "",
                	"pid": ""
                });
            }

        	did = didStr[1];
        	pid = pidStr[1];
        	console.log("did: "+did);
        	console.log("pid: "+pid);

        	return ({
        		"did": did,
        		"pid": pid
        	});
		}
		return commonInfo;
	}
}

exports.CommonInfo = CommonInfo;