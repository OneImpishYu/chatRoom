var md5 = require('md5-node')
const crypto = require('crypto');
/**
 * 验证签名
 * @param data_str 签名源串
 * @param sign 已生成的签名
 * @param PublicKey 公钥
 */
function verify(data_str, sign, PublicKey) {
    var verify = crypto.createVerify('RSA-SHA1');
    var data_md5 = md5(data_str);
    verify.update(new Buffer(data_md5));
    {}
    return verify.verify(PublicKey, sign, 'base64');
}
module.exports = verify;