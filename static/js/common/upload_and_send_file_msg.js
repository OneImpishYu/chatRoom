//弹出发文件对话框
function selectFileClick() {
    //判断浏览器版本
    if (webim.BROWSER_INFO.type == 'ie' && parseInt(webim.BROWSER_INFO.ver) <= 9) {
        alert('上传文件暂不支持ie9(含)以下浏览器');
    } else {
        $('#upd_file_form')[0].reset();
        var progress = document.getElementById('upd_file_progress');//上传文件进度条
        progress.value = 0;
        $('#upload_file_dialog').modal('show');
    }
}

//上传文件进度条回调函数
//loadedSize-已上传字节数
//totalSize-文件总字节数
function onFileProgressCallBack(loadedSize, totalSize) {
    var progress = document.getElementById('upd_file_progress');//上传文件进度条
    progress.value = (loadedSize / totalSize) * 100;
}

//上传文件
function uploadFile() {
    var uploadFiles = document.getElementById('upd_file');
    var file = uploadFiles.files[0];
    //先检查图片类型和大小
    if (!checkFile(file)) {
        return;
    }
    var businessType;//业务类型，1-发群文件，2-向好友发文件
    if (selType == webim.SESSION_TYPE.C2C) { //向好友发图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.C2C_MSG;
    } else if (selType == webim.SESSION_TYPE.GROUP) { //发群图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
    }
    //封装上传文件请求
    var opt = {
        'file': file, //文件对象
        'onProgressCallBack': onFileProgressCallBack, //上传文件进度条回调函数
        'To_Account': selToID, //接收者
        'businessType': businessType,//业务类型
        'fileType': webim.UPLOAD_RES_TYPE.FILE//表示上传文件
    };
    //上传文件
    webim.uploadFile(opt,
        function (resp) {
            //上传成功发送文件
            sendFile(resp,file.name);
            $('#upload_file_dialog').modal('hide');
        },
        function (err) {
            alert(err.ErrorInfo);
        }
    );
}
//发送文件消息
function sendFile(file,fileName) {
    if (!selToID) {
        alert("您还没有好友，暂不能聊天");
        return;
    }

    if (!selSess) {
        selSess = new webim.Session(selType, selToID, selToID, Math.round(new Date().getTime() / 1000));
    }
    var loginInfo = document.cookie;
    var msg = new webim.Msg(selSess, true, -1, -1, -1, loginInfo.identifier, 0, loginInfo.identifierNick);
    var uuid=file.File_UUID;//文件UUID
    var fileSize=file.File_Size;//文件大小
    var senderId=loginInfo.identifier;
    var downloadFlag=file.Download_Flag;
    if(!fileName){
        var random=Math.round(Math.random() * 4294967296);
        fileName=random.toString();
    }
    var fileObj=new webim.Msg.Elem.File(uuid,fileName, fileSize, senderId, selToID, downloadFlag, selType);
    var vip = sessionStorage.getItem('vip');
    var msgtosend = ["vip-"+vip+"&nbsp&nbsp"];
    var text_obj = new webim.Msg.Elem.Text(msgtosend);
    msg.addText(text_obj);
    msg.addFile(fileObj);
    //调用发送文件消息接口
    webim.sendMsg(msg, function (resp) {
        if (selType == webim.SESSION_TYPE.C2C) {//私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
            addMsg(msg);
        }
    }, function (err) {
        alert(err.ErrorInfo);
    });
}
//检查文件类型和大小
function checkFile(file) {
    fileSize = Math.round(file.size / 1024 * 100) / 100; //单位为KB
    if (fileSize > 20 * 1024) {
        alert("您选择的文件大小超过限制(最大为20M)，请重新选择");
        return false;
    }
    return true;
}


