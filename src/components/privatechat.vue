<template>
<div style="height:100%">
<div class="msgflow">
    <span id="msg_end" style="overflow:hidden"></span>
        </div>
        <el-form style="position:fixed; bottom:10;" @submit.native.prevent>
          <el-form-item>
        <a class="chat02_title_btn" href="javascript:void(0);" onclick="selectPicClick()" title="发送图片">图</a>
        <a class="chat02_title_btn" href="javascript:void(0);" onclick="selectFileClick()" title="发送文件">文</a>
        <a class="chat02_title_btn" href="javascript:void(0);" onclick="showEditCustomMsgDialog()" title="发送自定义消息">自</a>
          </el-form-item>
          <el-form-item id="video-discuss-tool">
        <el-input type="text" v-model="message" id="send_msg_text" class="msgedit" @keyup.enter.native="onSendMsg"></el-input>
        <el-button onclick="onSendC2cMsg()">发送</el-button>
        </el-form-item>
        </el-form>
        </div>
</template>
<script>
import { setCookie, getCookie, delCookie } from "../assets/js/cookie.js";
export default {
    data() {
    return {
      message_array: [],
      message: "友情提示：记得主动打个招呼呦"
    };
  },
  mounted() {
    if (getCookie("name")) {
      this.name = getCookie("name");
      var user = getCookie("name");
    }
    console.log("当前用户：", user);
    this.$http
      .post("/api/gensig", {
        name: this.name
      })
      .then(
        function(data) {
          var sig = data.body;
          //当前用户身份
          var loginInfo = {
            sdkAppID: 1400119988, //用户所属应用id,必填
            appIDAt3rd: 1400119988, //用户所属应用id，必填
            accountType: 33038, //用户所属应用帐号类型，必填
            identifier: user, //当前用户ID,必须是否字符串类型，选填
            userSig: sig,
            identifierNick: null, //当前用户昵称，选填
            headurl: "img/2016.gif" //当前用户默认头像，选填
          };
          webimLogin(loginInfo);
          onSendC2cMsg(loginInfo);
        },
        function(response) {
          console.log(response);
        }
      );
  },
  methods:{
    onSendMsg(){
      onSendC2cMsg();
    }
  },
}
</script>
<style>

</style>
