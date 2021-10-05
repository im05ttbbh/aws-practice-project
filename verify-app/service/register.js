const AWS = require('aws-sdk')
AWS.config.update({
    region: "us-east-1"
})
const util = require('../utils/util')
const bcrypt = require('bcryptjs')

const dynamodb = new AWS.DynamoDB.DocumentClient()
const userTable = 'jinmeister-users'

const register = async (userInfo) => {
    const name = userInfo.name
    const email = userInfo.email
    const username = userInfo.username
    const password = userInfo.password
    if (!username || !name || !email || !password) {
        return util.buildResponse(401, {
            message: 'すべての項目が必須です'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim())
    if (dynamoUser && dynamoUser.username) {
        return util.buildResponse(401, {
            message: 'ユーザー名は既に存在します。別のユーザー名を選択してください。'
        })
    }

    const encryptPW = bcrypt.hashSync(password.trim(), 10)
    const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptPW
    }

    const saveUserResponse = await saveUser(user)
    if (!saveUserResponse) {
        return util.buildResponse(503, {
            message: 'サーバーエラーが起きました。もう一度アクセスし直して下さい。'
        })
    }

    return util.buildResponse(200, { username: username })
}

const getUser = async (username) => {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return response.Item
    }, error => {
        console.error("getUserでエラーが起きました", error)
    })
}

const saveUser = async (user) => {
    const params = {
        TableName: userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true
    }, error => {
        console.error('saveUserでエラーが起きました', error)
    })
}

module.exports.register = register