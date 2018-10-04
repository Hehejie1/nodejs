const { db } = require('../Schema/connect')
const UserSchema = require("../Schema/usr")
const User  = db.model('users',UserSchema)

module.exports = User