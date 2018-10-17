<template>
  <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <h2>聊天室注册</h2>
  <el-form-item label="用户名" prop="name">
    <el-input type="name" v-model="ruleForm.name" auto-complete="off" placeholder="请输入用户名"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="pwd">
    <el-input type="password" v-model="ruleForm.pwd" auto-complete="off" placeholder="请输入密码"></el-input>
  </el-form-item>
  <el-form-item label="确认密码" prop="checkPass">
    <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off" placeholder="再次输入"></el-input>
  </el-form-item>
  <el-form-item label="验证码" prop="proving">
    <el-input v-model="ruleForm.proving" placeholder="请输入验证码" @blur="checkLpicma"></el-input>
    <input type="button" id="code" @click="createCode" v-model="checkCode">
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitForm('ruleForm')" style="margin-left:-100px;">提交</el-button>
    <el-button @click="resetForm('ruleForm')">重置</el-button>
  </el-form-item>
</el-form>
</template>

<script>
var code;
  export default {
    data() {
        var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.pwd) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        checkCode: '1234',
        ruleForm: {
          name: '',
          pwd: '',
          checkPass: '',
          proving: ''
        },
        rules: {
          name: [
            { required: true ,message: '请输入用户名' , trigger: 'blur' }
          ],
          pwd: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ],
          proving: [
            { required: true ,message: '请输入验证码', trigger: 'blur' }
          ]
        }
      };
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
        this.$refs[formName].validate((valid) => {
          if (valid) {
            var url = "/api/addUser";
            this.$http.post(url,{
              name:this.ruleForm.name,
              pwd:this.ruleForm.pwd
            }).then((res)=>{
              console.log(res)
              if(res.data == -1) {
                alert("该账号已存在");
              }else if(res.status == 200){
                alert("注册成功");
                window.location.href="http://localhost:8081";
              }
            })
          } 
        })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.demo-ruleForm{
  width:60%;
  height:60%;
  background-color:lightslategray;
  border: 2px solid rgb(117, 121, 121);
  margin:0 auto;
  margin-top:10%;
}
.demo-ruleForm .el-input{
  width:90%;
  float:left;
}
</style>
