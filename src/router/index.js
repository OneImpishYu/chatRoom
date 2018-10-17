import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login'
import Register from '@/components/register'
import Chatroom from '@/components/chatroom'
import Groupchat from '@/components/groupchat'
import Privatechat from '@/components/privatechat'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: '注册',
      component: Register
    },
    {
      path: '/chatroom',
      name: '聊天室',
      component: Chatroom,
      children:[
        {path: '/groupchat',component: Groupchat},
        {path: '/privatechat',component: Privatechat},
      ]
    }
  ],
  mode:"history" //消除链接#号
})
