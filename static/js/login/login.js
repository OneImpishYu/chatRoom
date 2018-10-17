//sdk登录
function sdkLogin(loginInfo) {
    //web sdk 登录
    webim.login(loginInfo, listeners, options,
        function (identifierNick) {
            //identifierNick为登录用户昵称(没有设置时，为帐号)，无登录态时为空
            //webim.Log.info('webim登录成功');
            applyJoinBigGroup(avChatRoomId); //加入大群
        },
        function (err) {
            alert(err.ErrorInfo);
        }
    ); //
}
function webimLogin(loginInfo) {
    webim.login(
        loginInfo, listeners, options,
        function (resp) {
            // window.location.href = 'http://localhost:8081/privatechat';
        },
        function (err) {
            alert(err.ErrorInfo);
        }
    );
}
//登出
function logout() {
    //登出
    webim.logout(
        function (resp) {
            webim.Log.info('登出成功');
            loginInfo.identifier = null;
            loginInfo.userSig = null;
            $("#video_sms_list").find("li").remove();
            var indexUrl = window.location.href;
            var pos = indexUrl.indexOf('?');
            if (pos >= 0) {
                indexUrl = indexUrl.substring(0, pos);
            }
            window.location.href = indexUrl;
        }
    );
}