const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
//返回文章发表页
exports.addPage = async (ctx) => {
    await ctx.render('add-article',{
        title : '文章发表页',
        session : ctx.session
    })
}

//文章的发表
exports.add = async (ctx) => {
    if (ctx.session.isNew){
        //true 就是没登陆
        return ctx.body = {
            msg : '用户未登录',
            status : 0
        }
    }
    const data = ctx.request.body
    // title // content tips author
    data.author = ctx.session.uid
    data.commentNum = 0

    await new Promise((resolve,reject) => {
        new Article(data).save((err,data)=> {
            if (err) return reject(err)
            //跟新用户文章列表
            User.update({_id : data.author},{$inc : {articleNum : 1}}, err => {
                if (err) return console.log(err)
            })
            resolve(data)

        })
    })
        .then(data => {
            ctx.body = {
                msg : '发表成功',
                status: 1
            }
        })
        .catch(err => {
            ctx.body = {
                msg : '发表失败',
                status : 0
            }
        })
}

//获取文章列表
exports.getList = async (ctx) => {
    //获取文章分页 作者对应的头像
    let page = parseInt(ctx.params.id) || 1    //注意这里的ctx.params.id获取出来的是
    page--
    const maxNum = await Article.estimatedDocumentCount((err,data) => err ? console.log(err) : data)

    const artList = await Article
        .find()
        .sort('-created')   //按照每一个的created降序排序
        .skip(5 * page)   //跳过多少条数据
        .limit(5)     //筛选到多少条
        .populate({
            path : "author",
            select : 'avatar _id username'
        })
        .then(data => data)
        .catch(err => console.log(err))

    await ctx.render('index',{
        session: ctx.session,
        title : '换换书社首页',
        artList,
        maxNum
    })
}

//获取文章列表
exports.details = async (ctx) => {
    const _id = ctx.params.id;
    //查找文章页
    const article = await Article
        .findById(_id)
        .populate({
            path : "author",
            select : 'avatar _id username'
        })
        .then(data => data)

    // 查找所有评论
    const comment = await Comment
        .find({article: _id})
        .sort("-created")
        .populate({
            path : "from",
            select : 'avatar _id username'
        })
        .then(data => data)
        .catch(err => console.log(err))

    await ctx.render("article",{
        title : article.title,
        article,
        session : ctx.session,
        comment
    })
}

//删除文章
exports.del = async ctx => {
    const _id = ctx.params.id

    let res = {
        state: 1,
        message: "成功"
    }

    await Article.findById(_id)
        .then(data => data.remove())
        .catch(err => {
            res = {
                state: 0,
                message: err
            }
        })

    ctx.body = res
}

//获取用户的文章
exports.articleList = async ctx => {
    console.log('获取用户的文章')
    const uid = ctx.session.uid
    console.log(uid)
    const data = await Article.find({author : uid})


    console.log(data)
    ctx.body = {
        code : 0,
        count : data.length,
        data
    }
}