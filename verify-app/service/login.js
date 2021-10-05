const AWS = require('aws-sdk')
AWS.config.update({
    region: "us-east-1"
})
const util = require('../utils/util')
const bcrypt = require('bcryptjs')

const dynamodb = new AWS.DynamoDB.DocumentClient()
const userTable = 'jinmeister-users'
const auth = require('../utils/auth')

const login = async (user) => {
    const username = user.username
    const password = user.password
    if (!user || !username || !password) {
        return util.buildResponse(401, {
            message: 'ユーザーネームとパスワードが必要です'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim())
    if (!dynamoUser || !dynamoUser.username) {
        return util.buildResponse(403, { message: 'ユーザーが存在しません' })
    }

    if (!bcrypt.compareSync(password, dynamoUser.password)) {
        return util.buildResponse(403, { message: 'パスワードが違います' })
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }
    const token = auth.generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }
    return util.buildResponse(200, response)
}

module.exports.login = login