const { db } = require('../Schema/connect')
const ArticleSchema = require("../Schema/article")

const Article  = db.model('articles',ArticleSchema)

module.exports = Article