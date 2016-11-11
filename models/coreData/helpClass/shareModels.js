//定义用户操作类
function UserOprInfo() {
	var userOprInfo;

	var set = function(oprInfo) {
		userOprInfo = oprInfo;
	}
	var get = function() {
		return userOprInfo;
	}

	return {
		set: set,
		get: get
	};
};

exports.UserOprInfo = UserOprInfo;