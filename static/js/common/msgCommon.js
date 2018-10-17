//IE9(含)以下浏览器用到的jsonp回调函数

function jsonpCallback(rspData) {
    //设置接口返回的数据
    webim.setJsonpLastRspData(rspData);
}

//把消息转换成Html
function convertMsgtoHtml(msg) {
    var html = "",
        elems, elem, type, content;
    elems = msg.getElems(); //获取消息包含的元素数组
    var count = elems.length;
    for (var i = 0; i < count; i++) {
        elem = elems[i];
        type = elem.getType(); //获取元素类型
        content = elem.getContent(); //获取元素对象
        switch (type) {
            case webim.MSG_ELEMENT_TYPE.TEXT:
            var eleHtml = convertTextMsgToHtml(content);
            //转义，防XSS
            html += webim.Tool.formatText2Html(eleHtml);
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE:
                html += convertImageMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.FILE:
                html += convertFileMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.CUSTOM:
            var eleHtml = convertCustomMsgToHtml(content);
            //转义，防XSS
            html += webim.Tool.formatText2Html(eleHtml);
                break;
            case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
                html += convertGroupTipMsgToHtml(content);
                break;
            default:
                webim.Log.error('未知消息元素类型: elemType=' + type);
                break;
        }
    }
    return webim.Tool.formatHtml2Text(html);
}
//解析文本消息元素
function convertTextMsgToHtml(content) {
    return content.getText();
}
//解析图片消息元素
function convertImageMsgToHtml(content, imageName) {
    var smallImage = content.getImage(webim.IMAGE_TYPE.SMALL); //小图
    var bigImage = content.getImage(webim.IMAGE_TYPE.LARGE); //大图
    var oriImage = content.getImage(webim.IMAGE_TYPE.ORIGIN); //原图
    if (!bigImage) {
        bigImage = smallImage;
    }
    if (!oriImage) {
        oriImage = smallImage;
    }
    return "<img name='" + imageName + "' src='" + smallImage.getUrl() + "#" + bigImage.getUrl() + "#" + oriImage.getUrl() + "' style='CURSOR: hand' id='" + content.getImageId() + "' bigImgUrl='" + bigImage.getUrl() + "' onclick='imageClick(this)' />";
}
//解析文件消息元素
function convertFileMsgToHtml(content) {
    var fileSize, unitStr;
    fileSize = content.getSize();
    unitStr = "Byte";
    if (fileSize >= 1024) {
        fileSize = Math.round(fileSize / 1024);
        unitStr = "KB";
    }
    // return '<a href="' + content.getDownUrl() + '" title="点击下载文件" ><i class="glyphicon glyphicon-file">&nbsp;' + content.getName() + '(' + fileSize + unitStr + ')</i></a>';

    return '<a href="javascript:;" onclick=\'webim.onDownFile("'+content.uuid+'")\' title="点击下载文件" ><i class="glyphicon glyphicon-file">&nbsp;' + content.name + '(' + fileSize + unitStr + ')</i></a>';
}
//弹出发自定义消息对话框
function showEditCustomMsgDialog(){
    $('#ecm_from')[0];
    $('#edit_custom_msg_dialog').modal('show');
}
//发送自定义消息
function sendCustomMsg() {
    if (!selToID) {
        alert("您还没有好友和群组，暂不能聊天");
        return;
    }
    var data = $("#ecm_data").val();
    var desc = $("#ecm_desc").val();
    var ext = $("#ecm_ext").val();
    var msgLen = webim.Tool.getStrBytes(data);
    if (data.length < 1){
        alert("发送消息不能为空");
        return;
    }
    var maxLen, errInfo;
    if (selType == webim.SESSION_TYPE.C2C){
        maxLen = webim.MSG_MAX_LENGTH.C2C;
        errInfo = "消息长度超出限制（最多"+ Math.round(maxLen / 3) +"汉字）";
    }else {
        maxLen = webim.MSG_MAX_LENGTH.GROUP;
        errInfo = "消息长度超出限制（最多"+ Math.round(maxLen / 3) +"汉字）";
    }
    if (msgLen > maxLen){
        alert(errInfo);
        return;
    }
    if(!selSess) {
        selSess = new webim.Session(selType, selToID, selToID, Math.round(new Date().getTime() / 1000));
    }
    var loginInfo = document.cookie;
    var msg = new webim.Msg(selSess, true, -1, -1, -1, loginInfo.identifier, 0, loginInfo.identifierNick);
    var custom_obj = new webim.Msg.Elem.Custom(data, desc, ext);
    msg.addCustom(custom_obj);
    //调用发送信息接口
    msg.sending = 1;
    webim.sendMsg(msg, function(resp){
        addMsg(msg);
        //showMsg(msg);
        $("#id_" + msg.random).find(".spinner").remove();
        $("#edit_custom_msg_dialog").modal('hide');
    },function (err){
        alert(err.ErrInfo);
    });
}
//解析自定义消息元素
function convertCustomMsgToHtml(content) {
    var data = content.getData();
    var desc = content.getDesc();
    var ext = content.getExt();
    return "数据："+ data + ", 描述：" + desc + ", Vip等级：" + ext;
}
//解析群提示消息元素
function convertGroupTipMsgToHtml(content) {
    var WEB_IM_GROUP_TIP_MAX_USER_COUNT = 10;
    var text = "";
    var maxIndex = WEB_IM_GROUP_TIP_MAX_USER_COUNT - 1;
    var opType, opUserId, userIdList;
    var memberCount;
    opType = content.getOpType(); //群提示消息类型（操作类型）
    opUserId = content.getOpUserId(); //操作人id
    userIdList = content.getUserInfo();
    switch (opType) {
        case webim.GROUP_TIP_TYPE.JOIN: //加入群
            for (var m in userIdList) {
                if (userIdList[m].NickName != undefined) {
                    text += userIdList[m].NickName + ",";
                } else {
                    text += userIdList[m].UserId + ",";
                }
                if (userIdList.length > WEB_IM_GROUP_TIP_MAX_USER_COUNT && m == maxIndex) {
                    text += "等" + userIdList.length + "人";
                    break;
                }
            }
            text = text.substring(0, text.length - 1);
            text += "进入房间";
            //房间成员数加1
            memberCount = $('#user-icon-fans').html();
            $('#user-icon-fans').html(parseInt(memberCount) + 1);
            break;
        case webim.GROUP_TIP_TYPE.QUIT: //退出群
            var quitName = content.getOpUserId();
            text += quitName + "离开房间";
            //房间成员数减1
            memberCount = parseInt($('#user-icon-fans').html());
            if (memberCount > 0) {
                $('#user-icon-fans').html(memberCount - 1);
            }
            break;
        default:
            text += "未知群提示消息类型：type=" + opType;
            break;
    }
    return text;
}
//单击图片事件
function imageClick(imgObj) {
    var imgUrls = imgObj.src;
    var imgUrlArr = imgUrls.split("#"); //字符分割
    var smallImgUrl = imgUrlArr[0]; //小图
    var bigImgUrl = imgUrlArr[1]; //大图
    var oriImgUrl = imgUrlArr[2]; //原图
    webim.Log.info("小图url:" + smallImgUrl);
    webim.Log.info("大图url:" + bigImgUrl);
    webim.Log.info("原图url:" + oriImgUrl);
}
