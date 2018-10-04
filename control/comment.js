const Comment = require('../Models/comment')
const User = require('../Models/user')
const Article = require('../Models/article')

exports.save = async ctx => {
    let message = {
        status : 0,
        msg : '登录才能返回对象'
    }
    //验证用户是否验证
    if(ctx.session.isNew) return ctx.body = message

    const data = ctx.request.body

    data.from = ctx.session.uid
    console.log('*****************')
    console.log(data)
    const _comment = new Comment(data)

    await _comment
        .save()
        .then(data => {
            console.log('评论成功')
            message = {
                status : 1,
                msg : '评论成功'
            }

            //更新当前文章的评论计数器
            Article
                .update({_id : data.article},{$inc : {commentNum : 1}} ,err => {
                    if(err) return console.log(err)
                    console.log('计数器更新成功')
                })

            //更新用户的评论计数器
            User.update({_id: data.from},{$inc : {commentNum: 1}},err=> {
                if (err) return console.log(err)
            })
        })
        .catch(err => {
            message = {
                status : 0,
                msg : err
            }
        })
    ctx.body = message
}

//后台 查询所有评论
exports.comlist =async ctx => {
    const uid = ctx.session.uid

    const  data = await Comment
        .find({from : uid})
        .populate("article","title")
    console.log(data)
    ctx.body = {
        code : 0,
        count : data.length,
        data
    }
}

//后台删除评论
exports.del = async ctx => {

    console.log('开始删除的Id : ' + ctx.request)
    //评论的id
    const commentId =ctx.params.id
    const uid = ctx.session.uid

    let res = {
        state : 1,
        message: "删除成功"
    }

    await Comment.findById(commentId,(err,data) => {
        if (err){
            return console.log(err)
        }else{
            articleId = data.article
        }

    })
    //文章的计数器减一
    await Article.update({_id :articleId},{$inc : {commentNum : -1}})

    //删除评论
    await User.update({_id : uid},{$inc : {commentNum : -1}})

    //删除评论
    await Comment.deleteOne({_id : commentId},err=>{
        if (err) res = {
            state : 0,
            message: "删除失败"
        }
    })
    ctx.body = res

}

