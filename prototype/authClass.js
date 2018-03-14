class Auth {
    authSession(req, res, next) {
        if (!req.session.user_id) {
            res.send({
                status: 401,
                message: '未登录'
            })
        } else {
            next();
        }
    }
}

export default new Auth();