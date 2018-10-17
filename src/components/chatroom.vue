<template>
<div style="height:100%">
<el-container style="border: 1px solid #eee;height:100%">
  <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
    <el-menu @select="handleSelect" :default-active="$route.path" router>
      <el-submenu index="1">
        <template slot="title"><i class="el-icon-message"></i>群聊</template>
        <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="/groupchat">群聊</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title"><i class="el-icon-menu"></i>单聊</template>
        <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="/privatechat">私聊</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </el-aside>
  <el-container style="height:95%">
    <el-header style="text-align: right; font-size: 12px">
      <el-dropdown>
        <i class="el-icon-setting" style="margin-right: 15px"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item><span onclick="quitBigGroup()">退群</span></el-dropdown-item>
          <el-dropdown-item><span @click="quit">退出</span></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span>{{name}}</span>
    </el-header>
    
    <el-main style="height:100%">
        <transition name="fade" mode="out-in">
    <router-view></router-view>
     </transition>
    </el-main>
    <el-footer></el-footer>
  </el-container>
</el-container>
  <div aria-hidden="true" aria-labelledby="upload_pic_dialog_label" class="modal fade" data-backdrop="static" id="upload_pic_dialog"
    role="dialog" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button aria-hidden="true" class="close" data-dismiss="modal" type="button">×</button>
          <h4 class="modal-title" id="upload_pic_dialog_label">发送图片</h4>
        </div>
        <div class="modal-body">
          <form class="form-horizontal" id="upd_form" name="upd_form" onkeydown="if(event.keyCode==13)return false;" role="form">
            <div class="form-group">
              <label class="col-sm-2 control-label" for="File">选择</label>
              <div class="col-sm-10">
                <input id="upd_pic" onchange="fileOnChange(this)" type="file">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label" for="File">预览</label>
              <div class="col-sm-10">
                <div id="previewPicDiv"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label" for="upd_progress">进度</label>
              <div class="col-sm-10">
                <progress id="upd_progress" max="100" value="0"></progress>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal" type="button">关闭</button>
          <button class="btn btn-primary" onclick="uploadPic()" type="button">发送</button>
        </div>
      </div>
    </div>
  </div>
  <div aria-hidden="true" aria-labelledby="upload_file_dialog_label" class="modal fade" data-backdrop="static" id="upload_file_dialog"
    role="dialog" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button aria-hidden="true" class="close" data-dismiss="modal" type="button">×</button>
          <h4 class="modal-title" id="upload_file_dialog_label">发送文件</h4>
        </div>
        <div class="modal-body">
          <form class="form-horizontal" id="upd_file_form" name="upd_file_form" onkeydown="if(event.keyCode==13)return false;" role="form">
            <div class="form-group">
              <label class="col-sm-2 control-label" for="File">选择</label>
              <div class="col-sm-10">
                <input id="upd_file" type="file">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label" for="upd_file_progress">进度</label>
              <div class="col-sm-10">
                <progress id="upd_file_progress" max="100" value="0"></progress>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal" type="button">关闭</button>
          <button class="btn btn-primary" onclick="uploadFile()" type="button">发送</button>
        </div>
      </div>
    </div>
  </div>
  <div aria-hidden="true" aria-labelledby="edit_custom_msg_label" class="modal fade" data-backdrop="static" id="edit_custom_msg_dialog"
    role="dialog" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button aria-hidden="true" class="close" data-dismiss="modal" type="button">×</button>
          <h4 class="modal-title" id="edit_custom_msg_label">发送自定义消息</h4>
        </div>
        <div class="modal-body">
          <form class="form-horizontal" id="ecm_form" name="ecm_form" onkeydown="if(event.keyCode==13)return false;" role="form">
            <div class="form-group">
              <label class="col-sm-2 control-label" for="ecm_data">数据</label>
              <div class="col-sm-10">
                <textarea class="form-control" id="ecm_data" rows="3"></textarea>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label" for="ecm_desc">描述</label>
              <div class="col-sm-10">
                <input class="form-control" id="ecm_desc" maxlength="50" placeholder="请输入描述" type="text">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label" for="ecm_ext">Vip等级</label>
              <div class="col-sm-10">
                <select class="form-control" id="ecm_ext" maxlength="50">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal" type="button">关闭</button>
          <button class="btn btn-primary" onclick="sendCustomMsg()" type="button">提交</button>
        </div>
      </div>
    </div>
  </div>
  <div aria-hidden="true" aria-labelledby="click_pic_dialog_label" class="modal fade" data-backdrop="static" id="click_pic_dialog"
    role="dialog" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button aria-hidden="true" class="close" data-dismiss="modal" type="button">×</button>
          <h4 class="modal-title" id="click_pic_dialog_label">查看图片</h4>
        </div>
        <div class="modal-body">
          <form class="form-horizontal" role="form">
            <div class="form-group">
              <div class="col-sm-12">
                <div id="bigPicDiv"></div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" data-dismiss="modal" type="button">关闭</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { setCookie, getCookie, delCookie } from "../assets/js/cookie.js";

export default {
  data() {
    return {
      activeIndex: 'groupchat',
      name: "",
      message: "请多关照"
    };
  },
  mounted(){
    if (getCookie("name")) {
      this.name = getCookie("name");
    }
  },
  methods: {
    quit() {
      delCookie("name");
      window.location.href = "http://localhost:8081";
    },
    handleSelect(key, keyPath) {
        console.log(key, keyPath);
      }
  }
};
</script>
<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
.video-discuss-like {
  background: url(../assets/img/like.png) no-repeat;
  background-size: 35px 35px;
  display: inline-block;
  width: 35px;
  height: 35px;
  position: absolute;
  right: 15px;
}

.video-discuss-like:focus,
.video-discuss-like:hover {
  background-image: url(../assets/img/like_hover.png);
}
</style>