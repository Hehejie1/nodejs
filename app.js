const Koa = require('koa')
const static = require('koa-static')
const views = require('koa-views')
const router = require('./routers/router')
const logger = require('koa-logger')
const body = require('koa-body')
const { join } = require('path')
const session = require('koa-session')
const compress = require('koa-compress')

//生成 Koa 实例
const app = new Koa

// 配置session 对象
app.keys = ["huanhuanss"]  //签名需要key

const FONFIG = {
    key : 'huanhuan', //用于加密的 KEY
    maxAge : 36e5,     //保存的时间  3600000  e5 => 00000
    overwrite : true,   //是否覆盖
    httpOnly : true,    //客户端是否可读
    signed : true,     //是否签名

}

// 注册日志模块
app.use(logger())

//配置session
app.use(session(FONFIG,app))
//配置koa-body处理post处理
app.use(body())
//配置静态资源
app.use(static(join(__dirname,"public")))
//配置视图模板
app.use(views(join(__dirname,'views'),{
    extension : 'pug'
}))
app.use(compress({
    threshold : 2048,   //达到多少开始压缩
    flush : require('zlib').Z_SYNC_FLUSH   //压缩引入模块
}))


app.use(router.routes()).use(router.allowedMethods())

app.listen(3005, ()=> {
    console.log('监听3005端口成功!!!!')
})

//创建管理元用户， 如果管理元已经存在 ，则返回
{
    //admin admin
    const { db } = require('./Schema/connect')
    const UserSchema = require("./Schema/usr")
    const crypto = require("./util/crypto")
    const User  = db.model('users',UserSchema)
    User
        .find({username : "admin"})
        .then(data => {
            if (data.length === 0){
                // 管理员不存在
                const _user = new User({
                    username: 'admin',
                    password : crypto('admin'),
                    role : '6666',
                    articleNum : 0,
                    commentNum : 0
                })

                _user.save(err => {
                    if (err) return console.log(err)
                    console.log('创建超级管理元成功')
                })
            } else{
                console.log('管理员为admin')
            }
        })

}