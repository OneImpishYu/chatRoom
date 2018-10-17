//SQL语句映射文件，供api逻辑调用

//sql语句
var sqlMap = {
    //用户
    user: {
        login: 'SELECT pwd FROM user WHERE name = ?;',
        add: 'insert into user(name,pwd) values ( ?, ?);',    //查询 password
        select_name: 'SELECT * from user where name = ?;',
        select_vip: 'SELECT vip FROM user WHERE name = ?;' //查询 用户等级
    }
}
module.exports = sqlMap;