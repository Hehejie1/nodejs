const crypto = require('../util/crypto')
const User = require('../Models/user')



//导出用户注册路由
exports.reg = async (ctx) => {
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    //去数据库users 先查询是否存在
    await new Promise((resolve,reject) => {
        User.find({username},(err,data) => {
            if (err) return reject(err)
            // 用户名存在
            if (data.length > 0){
                return resolve("")
            }
            // 用户名不存在
            const _user = new User({
                username,
                password :  crypto(password),
                commentNum : 0,
                articleNum : 0
            })
            _user.save((err,data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    })
        .then(async data => {
        if (data){ // 注册成功
            console.log('注册成功')
            await ctx.render('isOk',{
                status : '注册成功'
            })
        } else{  //用户名已存在
            console.log('用户名已存在')
            await ctx.render('isOk',{
                status : '用户名已存在'
            })
        }
    })
        .catch(async err => {
            await ctx.render('isOk',{
                status : '注册失败，请重试'
            })
        })
}

//导出用户登录路由
exports.login = async (ctx) => {
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    //去数据库users 先查询是否存在
    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if (err) return reject(err)
            // 用户名不存在
            if (data.length === 0) return reject("用户名不存在")

            // 把用户传过来的密码 加密后跟数据库的比对
            if(data[0].password === crypto(password)){
                return resolve(data)
            }
            resolve("")
        })
    }).then(async data => {
        if (!data){
            return ctx.render('isOk', {
                status: '密码错误,请重新填写'
            })
        }
        //让他在他的cookies里设置 username password 权限
        ctx.cookies.set("username",username, {
            domain : 'localhost',   //期望在那个服务器可以带过来
            path : '/',  //期望服务器下面什么能带来
            maxAge : 36e5,
            httpOnly : true,  //true 不能让客户端访问这个 cookie
            overwrite : false   //是否被覆盖
        })

        // 用户在数据库的_id 值
        ctx.cookies.set("uid", data[0]._id, {
            domain: "localhost",
            path: "/",
            maxAge: 36e5,
            httpOnly: true, // true 不让客户端能访问这个 cookie
            overwrite: false
        })

        ctx.session = {
            username,
            uid: data[0]._id,
            avatar: data[0].avatar,   //用户图片
            role: data[0].role
        }
        // 登录成功
        await ctx.render("isOk", {
            status: "登录成功"
        })
    })
        .catch(async err => {
            await ctx.render('isOk', {
                status: '登录失败！！'
            })
        })
}

//确定用户状态  保持用户状态
exports.keepLog = async  (ctx ,next) => {
    if (ctx.session.isNew){  //session里面没有
        if (ctx.cookies.get('username')){
            let uid = ctx.cookies.get("uid")
            const avatar = await User.findById(uid)
                .then(data => data.avatar)
            ctx.session = {
                username: ctx.cookies.get('username'),
                uid,
                avatar
            }
        }
}
await next()
}

//用户退出
exports.logout = async (ctx,next) => {
    ctx.session = null
    ctx.cookies.set('username',null,{
        maxAge : 0
    })
    ctx.cookies.set('uid',null,{
        maxAge : 0
    })
    ctx.redirect('/')
}

//用户头像上传
exports.upload = async  ctx => {
    const filename = ctx.req.file.filename
    ctx.session.avatar = "/avatar/" + filename
    // console.log(filename)

    let data = {}
    await User.updateOne({_id : ctx.session.uid},{$set:{avatar : "/avatar/" + filename}} ,(err,res) => {
        if (err) {
            data = {
                status : 0,
                message : err
            }
        }else {
            data = {
                status : 1,
                message : '上传成功'
            }
        }
    })

    ctx.body = data
}