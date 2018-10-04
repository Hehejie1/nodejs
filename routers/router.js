const Router = require('koa-router')
const user = require('../control/usr')
const article = require('../control/article')
const comment = require('../control/comment')
const admin = require('../control/admin')
const upload = require('../util/upload')


const router = new Router

//获取首页
router.get('/', user.keepLog ,article.getList)

//转到登录和注册页面
router.get(/^\/user\/(?=login|reg)/ ,async ctx => {
    const show = /reg$/.test(ctx.path)
    await ctx.render('register',{show})
})

//转到注册页面
router.get('/user' ,async ctx => {
    const show = true
    await ctx.render('register',{show})
})

// 用户登录
router.post('/user/login' , user.login)

// 用户注册
router.post('/user/reg' , user.reg)

//用户退出
router.get('/user/logout' , user.logout)

//文章发表页面
router.get('/article' ,user.keepLog ,article.addPage)
//文章发表页面
router.post('/article' ,user.keepLog ,article.add)

//文章列表分页    /page/3
router.get('/page/:id',article.getList)

//文章的详情页
router.get('/article/:id', user.keepLog ,article.details )

//添加评论
router.post('/comment', user.keepLog , comment.save)

//个人中心
router.get('/admin/:id',user.keepLog,admin.index)

//头像上传功能
router.post('/upload',user.keepLog, upload.single('file'),user.upload)

//获取用户所有评论
router.get('/user/comments',user.keepLog,comment.comlist)

//删除用户所有评论
router.del('/comment/:id',user.keepLog,comment.del)

// 获取用户的所有文章
router.get("/user/articles", user.keepLog, article.articleList)

// 后台：文章
router.del("/article/:id", user.keepLog, article.del)

//404页面
router.get("*" ,async ctx => {
    await  ctx.render('404',{
        title : '404'
    })
})

module.exports = router