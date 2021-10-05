const util = require('../utils/util')
const auth = require('../utils/auth')

const verify = (responseBody) => {
    if (!responseBody || !responseBody.user.username || !responseBody.token) {
        return util.buildResponse(401, {
            verified: false,
            message: '不正なリクエストです'
        })
    }

    const user = requestBody.user
    const token = requestBody.token
    const verification = auth.verifyToken(user.username, token)
    if (!verification.verified) {
        return util.buildResponse(401, verification)
    }

    return util.buildResponse(200, {
        verified: true,
        message: 'success',
        user: user,
        token: token
    })
}


module.exports.verify = verify