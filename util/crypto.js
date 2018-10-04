const crypto = require('crypto')

//返回加密成功的数据
module.exports = function (password, key =  'huanhuanss') {
    const hmac = crypto.createHmac('sha256',key)
    hmac.update(password)
    password = hmac.digest('hex')
    return password
}