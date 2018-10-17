//node 后端服务器

const userApi = require('./api/userApi');
const fs = require('fs');//node导入文件系统模块
const path = require('path');//处理文件路径
const bodyParser = require('body-parser');//解析post数据
const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 服务开启后访问指定编译好的dist文件下的数据
app.use(express.static(path.resolve(__dirname, '../dist')))
app.get('*', function(req, res) {
    const html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')
    res.send(html)
})

//后端api路由
app.use('/api', userApi);

//监听端口
app.listen(3000);
console.log('success listen at port:3000....');