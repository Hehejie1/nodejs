const { db } = require('../Schema/connect')
const CommentSchema = require("../Schema/comment")

const Comment  = db.model('Comments',CommentSchema)

module.exports = Comment