//获取新消息
//监听私信消息  newMsgList为新消息数组 结构为[MSG]
var msgList = [];
var dateStart = null;
var dateEnd = null;
function onMsgNotify(newMsgList) {
    var sess, newMsg;
    //获取聊天会话
    var sessMap = webim.MsgStore.sessMap();
    for (var j in newMsgList) {
        //遍历新消息
        newMsg = newMsgList[j];
        if(!selToID){//没有聊天对象
            selToID=newMsg.getSession().id();
            selType=newMsg.getSession().type();
            selSess=newMsg.getSession();
            var headUrl;
            addSess(selType,selToID, newMsg.getSession().name(), headUrl, 0, 'sesslist');//新增一个对象
            setSelSessStyleOn(selToID);
        }
        // if (newMsg.getSession().id() == selToID) {//当前聊天对象消息
            //selSess = newMsg.getSession();
            //在聊天窗体中添加一条消息
            addMsg(newMsg);
        // }
        msgList.push(newMsg.elems[0].content.text);
    }
}

//发送消息(文本)
var dloginInfo;
function onSendC2cMsg(loginInfo) {
    if (loginInfo == null) loginInfo = dloginInfo;
    dloginInfo = loginInfo;
    if (!selToID) {
        alert("你还没有选中好友或者群组，暂不能聊天");
        $("#send_msg_text").val('');
        return;
    }
    //获取消息内容
    var msgContent = $("#send_msg_text").val();
    var msgLen = webim.Tool.getStrBytes(msgContent);
    if (msgContent.length < 1) {
        alert("发送的消息不能为空!");
        $("#send_msg_text").val('');
        return;
    }
    var maxLen, errInfo;
    if (selType == webim.SESSION_TYPE.C2C) {
        maxLen = webim.MSG_MAX_LENGTH.C2C;
        errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    } else {
        maxLen = webim.MSG_MAX_LENGTH.GROUP;
        errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    }
    if (msgLen > maxLen) {
        alert(errInfo);
        return;
    }
    if (!selSess) {
        var selSess = new webim.Session(selType, selToID, selToID, Math.round(new Date().getTime() / 1000));
    }
    var isSend = true; //是否为自己发送
    var seq = -1; //消息序列，-1表示sdk自动生成，用于去重
    var random = Math.round(Math.random() * 4294967296); //消息随机数，用于去重
    var msgTime = Math.round(new Date().getTime() / 1000); //消息时间戳
    var subType; //消息子类型
    if (selType == webim.SESSION_TYPE.C2C) {
        subType = webim.C2C_MSG_SUB_TYPE.COMMON;
    } else {
        subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
    }
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, loginInfo.identifier, subType, loginInfo.identifierNick);
    var text_obj, face_obj, tmsg, emotionIndex, emotion, restMsgIndex;
    //解析文本
    var expr = /\[[^[\]]{1,3}\]/mg;
    text_obj = new webim.Msg.Elem.Text(msgContent);
        msg.addText(text_obj);
        msg.sending = 1;
        msg.originContent = msgContent;
        addMsg(msg);
        $("#send_msg_text").val('');
    webim.sendMsg(msg, function(resp) {
        //发送成功，把sending清理
        $("#id_" + msg.random).find(".spinner").remove();
        webim.Tool.setCookie("tmpmsg_" + selToID, '', 0);
    }, function(err) {
        alert(err.ErrorInfo);
    });
}

//聊天页面增加一条消息
function addMsg(msg,prepend) {
    var isSelfSend, fromAccount, fromAccountNick, fromAccountImage,sessType, subType;
    //获取会话类型，目前只支持群聊
    //webim.SESSION_TYPE.GROUP-群聊，
    //webim.SESSION_TYPE.C2C-私聊，
    sessType = msg.getSession().type();
    isSelfSend = msg.getIsSend();//消息是否为自己发的
    fromAccount = msg.getFromAccount();
    if (!fromAccount) {
        return;
    }
    if(isSelfSend){//如果是自己发的消息
        var loginInfo = document.cookie;
        if(loginInfo.identifierNick){
            fromAccountNick=loginInfo.identifierNick;
        }else{
            fromAccountNick = fromAccount;
        }
    }else{//如果别人发的消息
        var key = webim.SESSION_TYPE.C2C + "_" + fromAccount;
        var info = infoMap[key];
        if (info && info.name) {
            fromAccountNick = info.name;
        } else if (msg.getFromAccountNick()) {
            fromAccountNick = msg.getFromAccountNick();
        } else {
            fromAccountNick = fromAccount;
        }
    }
    var onemsg = document.createElement("div");
    if(msg.sending){
        onemsg.id = "id_"+msg.random;
        //发送中
        var spinner = document.createElement("div");
        spinner.className = "spinner";
        spinner.innerHTML = '<div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div>';
        onemsg.appendChild(spinner);
    }else{
        $("#id_"+msg.random).remove();
    }
    onemsg.className = "onemsg";
    var msghead = document.createElement("p");
    var msgbody = document.createElement("p");
    var msgPre = document.createElement("pre");
    msghead.className = "msghead";
    msgbody.className = "msgbody";
    //如果是发给自己的消息
    if (!isSelfSend){msghead.style.color = "pink";}
        else{msghead.style.color = "skyblue";}
    //昵称  消息时间
    msghead.innerHTML = webim.Tool.formatText2Html(fromAccountNick + "&nbsp;&nbsp;" + webim.Tool.formatTimeStamp(msg.getTime()));
    msghead.onclick = function (){
        selToID = fromAccountNick;
        alert("以保存用户"+fromAccountNick+"的ID");
    };
    //解析消息
    //获取消息子类型
    //会话类型为群聊时，子类型为：webim.GROUP_MSG_SUB_TYPE
    //会话类型为私聊时，子类型为：webim.C2C_MSG_SUB_TYPE
    subType = msg.getSubType();
    switch (subType) {
        case webim.GROUP_MSG_SUB_TYPE.COMMON://群普通消息
            msgPre.innerHTML = convertMsgtoHtml(msg);
            break;
        case webim.GROUP_MSG_SUB_TYPE.REDPACKET://群红包消息
            msgPre.innerHTML = "[群红包消息]" + convertMsgtoHtml(msg);
            break;
        case webim.GROUP_MSG_SUB_TYPE.LOVEMSG://群点赞消息
            //业务自己可以增加逻辑，比如展示点赞动画效果
            msgPre.innerHTML = "[群点赞消息]" + convertMsgtoHtml(msg);
            //展示点赞动画
            //showLoveMsgAnimation();
            break;
        case webim.GROUP_MSG_SUB_TYPE.TIP://群提示消息
            msgPre.innerHTML = "[群提示消息]" + convertMsgtoHtml(msg);
            break;
    }
    msgbody.appendChild(msgPre);
    onemsg.appendChild(msghead);
    onemsg.appendChild(msgbody);
    //消息列表
    var msgflow = document.getElementsByClassName("msgflow")[0];
    if(prepend){
        //300ms后,等待图片加载完，滚动条自动滚动到底部
        msgflow.insertBefore(onemsg, msgflow.firstChild);
        if(msgflow.scrollTop == 0 ){
            setTimeout(function () {
                msgflow.scrollTop = 0;
            }, 300);
        }
    }else{
        msgflow.appendChild(onemsg);
        //300ms后,等待图片加载完，滚动条自动滚动到底部
        setTimeout(function () {
            //msgflow.scrollTop = msgflow.scrollHeight;
        }, 300);
    }
}
