//建立api接口
var models = require('../db');//数据库链接信息
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var $sql = require('../sqlMap');
var TimRestAPI = require('../../imsdk_restapi-nodejs-sdk/lib/TimRestApi.js');
const fs = require('fs');
const crypto = require('crypto');    
const PublicKey = fs.readFileSync('../server/rsa_public_key.pem').toString('utf-8')
const PrivateKey = fs.readFileSync('../server/rsa_private_key.pem').toString('utf-8')
var md5 = require('md5-node')
var utility = require('utility')
//连接数据库
var conn = mysql.createConnection(models.mysql);
conn.connect();

var jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

//生成Sig
router.post('/gensig', (req, res) => {
    var params = req.body;
    var results =[];
    var config = {
        sdkAppid: '1400119988',
        identifier: params.name,
        accountType: '33038',
        privateKey: '../../imsdk_restapi-nodejs-sdk/private.pem',
        expireAfter: 30 * 24 * 3600,
    }
    var tra = new TimRestAPI(config);
                    tra.init(function () { });
                    results.push({usersig:tra.usersig,PublicKey:PublicKey});
                    res.send(results)
});
//登录用户接口
router.post('/login', (req, res) => {
    var sql = $sql.user.login;
    var params = req.body;
    var results=[];
    console.log("sql", sql);
    console.log("params", params);
    conn.query(sql, [params.name], function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            for (var i = 0; i < result.length; i++) {
                console.log("请求回来！", result[i])
                console.log("请求结果！", typeof result[i], result[i].pwd, params.pwd);
                if (result[i].pwd === params.pwd) {
                    var config = {
                        sdkAppid: '1400119988',
                        identifier: params.name,
                        accountType: '33038',
                        privateKey: '../../imsdk_restapi-nodejs-sdk/private.pem',
                        expireAfter: 30 * 24 * 3600,
                    }
                    var tra = new TimRestAPI(config);
                    tra.init(function () { });
                  var sql_vip = $sql.user.select_vip;
                  conn.query(sql_vip, params.name, function (err, rows) {
                    if (err) throw err;
                    for (var i = 0; i < rows.length; i++) {
                      console.log("等级显示:", rows[i].vip);
                      //等级添加签名
                      var data_str = rows[i].vip;
                      var data_md5 = md5(data_str);
                      var sign = crypto.createSign('RSA-SHA1');
                      sign.update(new Buffer(data_md5));
                      var sign = sign.sign(PrivateKey,'base64');
                      results.push({vip:data_str,sign:sign,usersig:tra.usersig});
                    }
                    console.log('result:',results);
                    res.send(results);
                  });
                }
            }
        }
    })
});
{}
//增加用户接口
router.post('/addUser', (req, res) => {
      var sql_name = $sql.user.select_name
      var sql = $sql.user.add;
    var params = req.body;
    console.log("sql", sql);
    console.log("params", params);
    conn.query(sql_name, params.name, function (err, result) {
        if (err) {
            console.log(err)
        }
        if (result[0]===undefined){
            conn.query(sql,[params.name,params.pwd],function(err,result){
                if(err){
                    console.log(err)
                }
                if(result){
                    jsonWrite(res,result)
                }
            })
        } else {
            res.send('-1')
        }
    })
});
 

module.exports = router;