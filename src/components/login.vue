<template>
  <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <h2>聊天室登陆</h2>
  <el-form-item label="用户名" prop="name">
    <el-input type="name" v-model="ruleForm.name" auto-complete="off" placeholder="请输入用户名"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="pwd">
    <el-input type="password" v-model="ruleForm.pwd" auto-complete="off" placeholder="请输入密码"></el-input>
  </el-form-item>
  <el-form-item label="验证码" prop="proving">
    <el-input v-model="ruleForm.proving" placeholder="请输入验证码" @blur="checkLpicma"></el-input>
    <input type="button" id="code" @click="createCode" v-model="checkCode">
</el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitForm('ruleForm')" style="margin-left:-100px;">登录</el-button>
    <el-button @click="resetForm('ruleForm')">重置</el-button>
  </el-form-item>
  <el-form-item>
    <span style="margin-left:-100px;cursor:pointer" @click="jumpTo('/register')">立即注册</span>
  </el-form-item>
</el-form>
</template>

<script>
import { setCookie, getCookie } from "../assets/js/cookie.js";
var code;
export default {
  data() {
    return {
      checkCode: '1234',
      ruleForm: {
        name: "",
        pwd: "",
        proving: ""
      },
      rules: {
        name: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        pwd: [{ required: true, message: "请输入密码", trigger: "blur" }],
        proving: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    };
  },
  mounted() {
    // /*页面挂载获取cookie，如果存在username的cookie，则跳转到主页，不需登录*/
    // if (getCookie("name")) {
    //   this.$router.push("/chatroom");
    // }
  },
  methods: {
    //图片验证码
    createCode() {
      code = "";
      var codeLength = 4;
      var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
        for (var i = 0; i < codeLength; i++) {
        //循环操作 
        var index = Math.floor(Math.random() * 36);//取得随机数的索引（0~35） 
        code += random[index];//根据索引取得随机数加到code上 
      }
      this.checkCode = code;//把code值赋给验证码 
    },
    // 失焦验证图和密码
    checkLpicma() {
      this.ruleForm.proving.toUpperCase();//取得输入的验证码并转化为大写   
      if (this.ruleForm.proving == '') {
      } else if (this.ruleForm.proving.toUpperCase() != this.checkCode) {
        //若输入的验证码与产生的验证码不一致时 
        alert("验证码不正确")
        this.createCode();//刷新验证码 
        this.ruleForm.proving = '';
      } else {
        return true;
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var url = "/api/login";
          this.$http
            .post(url, {
              name: this.ruleForm.name,
              pwd: this.ruleForm.pwd
            })
            .then(
              function(data) {
                console.log("请求成功", data.body);
                var content = data.body;
                console.log("长度", content);
                if (content.length != 0) {
                  //当前用户身份
                  var loginInfo = {
                    sdkAppID: 1400119988, //用户所属应用id,必填
                    appIDAt3rd: 1400119988, //用户所属应用id，必填
                    accountType: 33038, //用户所属应用帐号类型，必填
                    identifier: this.ruleForm.name, //当前用户ID,必须是否字符串类型，选填
                    identifierNick: null, //当前用户昵称，选填
                    userSig: content[0].usersig, //当前用户身份凭证，必须是字符串类型，选填
                    headurl: "img/2016.gif" //当前用户默认头像，选填
                  };
                  sessionStorage.setItem('vip',content[0].vip)
                  sessionStorage.setItem('sign',content[0].sign)
                  webimLogin(loginInfo);
                  setCookie("name", this.ruleForm.name, 1000 * 60 * 5);
                  document.cookie = loginInfo;
                  window.location.href="http://localhost:8081/groupchat";
                } else {
                  alert("账户密码错误！");
                }
              },
              function(response) {
                console.log(response);
              }
            );
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    jumpTo(url) {
      this.defaultActiveIndex = url;
      this.$router.push(url); //用go刷新
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.demo-ruleForm {
  width: 60%;
  height: 60%;
  background-color: lightslategray;
  border: 2px solid rgb(117, 121, 121);
  margin: 0 auto;
  margin-top: 10%;
}
.demo-ruleForm .el-input {
  width: 90%;
  float: left;
}
</style>
