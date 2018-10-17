const crypto = require("crypto");
const md5 = require('md5-node')
const PublicKey = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+Tif09cEj79B8agMTwYCEz3A6\nt6/mseLH8hHEVq+J7Lyj0wapAnG+qvBhwktXFPyd+DL/FwuTFlmPtqutlVSRl8pv\nj3BodGub+vHrLzhv0CIp3v23a3FdeoJFAQLP3kbUvlk/PIdTQN5atEk6G/OhKW7g\nI6cqUZ10ctt7N7atdQIDAQAB\n-----END PUBLIC KEY-----'
//进入大群
window.applyJoinBigGroup = function(groupId) {
    var options = {
        'GroupId': groupId //群id
    };
    webim.applyJoinBigGroup(
        options,
        function (resp) {
            if (resp.JoinedStatus && resp.JoinedStatus == 'JoinedSuccess') {
                webim.Log.info('进群成功');
                selToID = groupId;
            } else {
                alert('进群失败');
            }
        },
        function (err) {
            alert(err.ErrorInfo);
        }
    );
}
//监听大群新消息（普通，点赞，提示）
window.onBigGroupMsgNotify = function(msgList) {
    for (var i = msgList.length - 1; i >= 0; i--) { //遍历消息，按照时间从后往前
        var msg = msgList[i];
        webim.Log.warn('receive a new avchatroom group msg: ' + msg.getFromAccountNick());
        //显示收到的消息
        showMsg(msg);
    }
}
var data_str = sessionStorage.getItem('vip');
var sign = sessionStorage.getItem('sign');
//发送消息(普通消息)
var dloginInfo;
window.onSendGroupMsg = function(loginInfo) {
    if (loginInfo == null) loginInfo = dloginInfo;
    dloginInfo = loginInfo;
    if (!loginInfo.identifier) { //未登录
        //独立模式
        alert('请填写帐号和密码进行聊天');
        $('#login_dialog').show();
        return;
    }
    //获取大群消息内容
    var msgtosend = ["vip"+data_str+"&nbsp&nbsp"+$("#send_msg_text").val()];
    var msgLen = webim.Tool.getStrBytes(msgtosend);
    if (msgtosend.length < 1||msgtosend == ["vip"+data_str]+"&nbsp&nbsp") {
        alert("发送的消息不能为空!");
        $("#send_msg_text").val('');
        return;
    }
    var maxLen, errInfo;
    if (selType == webim.SESSION_TYPE.GROUP) {
        maxLen = webim.MSG_MAX_LENGTH.GROUP;
        errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    } else {
        maxLen = webim.MSG_MAX_LENGTH.C2C;
        errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    }
    if (msgLen > maxLen) {
        alert(errInfo);
        return;
    }
    if (!selSess) {
        selSess = new webim.Session(selType, selToID, selToID, selSessHeadUrl, Math.round(new Date().getTime() / 1000));
    }
    var isSend = true; //是否为自己发送
    var seq = -1; //消息序列，-1表示sdk自动生成，用于去重
    var random = Math.round(Math.random() * 4294967296); //消息随机数，用于去重
    var msgTime = Math.round(new Date().getTime() / 1000); //消息时间戳
    var sign = this.sign; //签名字段
    var subType; //消息子类型
    if (selType == webim.SESSION_TYPE.GROUP) {
        subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
    }
    else{
            subType = webim.C2C_MSG_SUB_TYPE.COMMON;
        }
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, sign, loginInfo.identifier, subType, loginInfo.identifierNick);
    //解析文本
    var expr = /\[[^[\]]{1,3}\]/mg;
    var text_obj, face_obj, tmsg, emotionIndex, emotion, restMsgIndex;
        text_obj = new webim.Msg.Elem.Text(msgtosend);
        msg.addText(text_obj);
    webim.sendMsg(msg, function (resp) {
        $("#send_msg_text").val('');
    }, function (err) {
        alert("发消息失败:" + err.ErrorInfo);
        $("#send_msg_text").val('');
    });
}
//发送消息(大群点赞消息)
window.sendGroupLoveMsg = function(loginInfo) {
    if (loginInfo == null) loginInfo = dloginInfo;
    dloginInfo = loginInfo;
    if (!loginInfo.identifier) { //未登录
        //独立模式
        alert('请填写帐号和密码进行点赞');
        return true;
    }
    if (!selToID) {
        alert("您还没有进入房间，暂不能点赞");
        return false;
    }
    if (!selSess) {
        selSess = new webim.Session(selType, selToID, selToID, selSessHeadUrl, Math.round(new Date().getTime() / 1000));
    }
    var isSend = true; //是否为自己发送
    var seq = -1; //消息序列，-1表示sdk自动生成，用于去重
    var random = Math.round(Math.random() * 4294967296); //消息随机数，用于去重
    var msgTime = Math.round(new Date().getTime() / 1000); //消息时间戳
    var subType = webim.GROUP_MSG_SUB_TYPE.LOVEMSG;
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, loginInfo.identifier, subType, loginInfo.identifierNick);
    var msgtosend = ["vip"+data_str+"&nbsp&nbsp"+'love_msg'];
    var text_obj = new webim.Msg.Elem.Text(msgtosend);
    msg.addText(text_obj);
    webim.sendMsg(msg, function (resp) {
        webim.Log.info("点赞成功");
    }, function (err) {
        webim.Log.error("发送点赞消息失败:" + err.ErrorInfo);
        alert("发送点赞消息失败:" + err.ErrorInfo);
    });
}

//显示消息（大群普通+点赞+提示）
function showMsg(msg) {
    var isSelfSend, fromAccount, fromAccountNick, sessType, subType;
    var ul, li, paneDiv, textDiv, nickNameSpan, contentSpan;
    fromAccount = msg.getFromAccount();
    if (!fromAccount) {
        fromAccount = '';
    }
    fromAccountNick = msg.getFromAccountNick();
    if (!fromAccountNick) {
        fromAccountNick = '未知用户';
    }
    ul = document.getElementById("video_sms_list");
    var maxDisplayMsgCount = 77;
    var opacityStep = 0.2;
    var opacity;
    var childrenLiList = $("#video_sms_list").children();
    if (childrenLiList.length == maxDisplayMsgCount) {
        $("#video_sms_list").children(":first").remove();
        for (var i = 0; i < maxDisplayMsgCount; i++) {
            opacity = opacityStep * (i + 1) + 0.2;
            $('#video_sms_list').children().eq(i).css("opacity", opacity);
        }
    }
    li = document.createElement("li");
    paneDiv = document.createElement("div");
    paneDiv.setAttribute('class', 'video-sms-pane');
    textDiv = document.createElement("div");
    textDiv.setAttribute('class', 'video-sms-text');
    nickNameSpan = document.createElement("span");
    //为生成的span 绑定点击事件
    nickNameSpan.onclick = function (){
        sessionStorage.setItem('selToID',fromAccountNick);
            if(confirm("跳转至私聊，与用户"+fromAccountNick+"进行一对一聊天")){
                window.location.href="http://localhost:8081/privatechat";
            }else{}
    };
    var colorList = ['red', 'green', 'blue', 'org'];
    var index = Math.round(fromAccount.length % colorList.length);
    var color = colorList[index];
    nickNameSpan.setAttribute('class', 'user-name-' + color);
    nickNameSpan.innerHTML = webim.Tool.formatText2Html("" + fromAccountNick + "");
    contentSpan = document.createElement("span");
    Sign = msg.getSign();
    //解析消息
    //获取会话类型，目前只支持群聊
    //webim.SESSION_TYPE.GROUP-群聊
    sessType = msg.getSession().type();
    //获取消息子类型
    //会话类型为群聊时，子类型为：webim.GROUP_MSG_SUB_TYPE
    //会话类型为私聊时，子类型为：webim.C2C_MSG_SUB_TYPE
    subType = msg.getSubType();
    isSelfSend = msg.getIsSend(); //消息是否为自己发的
    switch (subType) {
        case webim.GROUP_MSG_SUB_TYPE.COMMON: //群普通消息
            contentSpan.innerHTML = convertMsgtoHtml(msg);
            break;
        case webim.GROUP_MSG_SUB_TYPE.LOVEMSG: //群点赞消息
            //业务自己可以增加逻辑，比如展示点赞动画效果
            contentSpan.innerHTML = convertMsgtoHtml(msg) + "[群点赞消息]";
            //展示点赞动画
            showLoveMsgAnimation();
            break;
        case webim.GROUP_MSG_SUB_TYPE.TIP: //群提示消息
            contentSpan.innerHTML = "[群提示消息]" + convertMsgtoHtml(msg);
            break;
        default:
            contentSpan.innerHTML = msg.tipText;
            break;
    }
    textDiv.appendChild(nickNameSpan);
    verify(data_str, sign, PublicKey);
    if(verify(data_str, sign, PublicKey) == true){
        textDiv.appendChild(contentSpan);
    }
/**
 * 验证签名
 * @param data_str 签名源串
 * @param sign 已生成的签名
 * @param PublicKey 公钥
 */
function verify(data_str, sign, PublicKey) {
    var verify = crypto.createVerify('RSA-SHA1');
    var data_md5 = md5(data_str);
    verify.update(new Buffer(data_md5));
    {}
    return verify.verify(PublicKey, sign, 'base64');
}
    paneDiv.appendChild(textDiv);
    li.appendChild(paneDiv);
    ul.appendChild(li);
}
//展示点赞动画
function showLoveMsgAnimation() {
    //点赞数加1
    var loveCount = $('#user-icon-like').html();
    $('#user-icon-like').html(parseInt(loveCount) + 1);
    var toolDiv = document.getElementById("video-discuss-tool");
    var loveSpan = document.createElement("span");
    var colorList = ['red', 'green', 'blue'];
    var max = colorList.length - 1;
    var min = 0;
    var index = parseInt(Math.random() * (max - min + 1) + min, max + 1);
    var color = colorList[index];
    loveSpan.setAttribute('class', 'like-icon zoomIn ' + color);
    toolDiv.appendChild(loveSpan);
}

//退出大群
function quitBigGroup() {
    var options = {
        'GroupId': avChatRoomId //群id
    };
    webim.quitBigGroup(
        options,
        function (resp) {
            webim.Log.info('退群成功');
            $("#video_sms_list").find("li").remove();
        },
        function (err) {
            alert(err.ErrorInfo);
        }
    );
}
