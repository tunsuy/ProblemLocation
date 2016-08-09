function checkInput(myId){
	var myIdValue = document.getElementById(myId).value;
	if(myIdValue == "" || myIdValue == null){
	    alert("手机号码不可为空");
	    return false;
	}
	else
		return true;
} 