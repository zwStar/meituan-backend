import AddressClass from '../../prototype/addressClass'
import crypto from 'crypto'
import AdminModel from '../../models/admin/admin'
import AddressModel from '../../models/admin/address'
import dtime from 'time-formater'
import moment from 'moment'
class Admin extends AddressClass {
    constructor() {
        super();
        this.user_login = this.user_login.bind(this);
        this.admin_login = this.admin_login.bind(this);
        this.add_address = this.add_address.bind(this);
    }

    //前台登录
    async user_login(req, res, next) {
        const {username, password} = req.body;
        const md5password = await this.encryption(password);
        try {
            const user = await AdminModel.findOne({username, status: 1});

            if (!user) {     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就默认以用户输入的用户名和密码创建一个新的账号
                const user_id = await this.getId('user_id');
                const cityInfo = await this.guessPosition(req);
                const create_data = {          //创建一个新登录记录
                    username,              //用户名
                    password: md5password,  //用户密码
                    id: user_id,           //用户id
                    status: 1,                     //
                    city: cityInfo.city         //登录城市
                }
                await new AdminModel(create_data).save();
                req.session.user_id = user_id;    //设置session
                res.send({
                    status: 1,
                    success: '注册用户并登录成功',
                })
            } else if (md5password === user.password) {  //用户输入的账号存在并且密码正确
                req.session.user_id = user.id;
                res.send({
                    status: 1,
                    success: '登录成功'
                })
            } else {
                res.send({
                    status: -1,
                    message: '该用户已存在，密码输入错误',
                })
            }
        } catch (err) {
            console.log('用户登录失败', err);
            res.send({
                status: -1,
                message: '用户登录失败',
            })
        }
    }

    //管理端登录
    async admin_login(req, res, next) {
        const {username, password} = req.body;
        const md5password = this.encryption(password);

        try {
            const admin = await AdminModel.findOne({username, status: 2});
            if (!admin) {     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就默认以用户输入的用户名和密码创建一个新的账号
                const admin_id = await this.getId('admin_id');
                const cityInfo = await this.guessPosition(req);
                const create_data = {          //创建一个新登录记录
                    username,              //用户名
                    password: md5password,  //用户密码
                    id: admin_id,           //用户id
                    status: 2,                     //
                    city: cityInfo.city         //登录城市
                }
                let createAdmin = await new AdminModel(create_data).save();
                req.session.admin_id = admin_id;    //设置session
                res.send({
                    status: 1,
                    success: '注册管理端并登录成功',
                    username:createAdmin.username,
                    avatar:createAdmin.avatar
                })
            } else if (md5password === admin.password) {  //用户输入的账号存在并且密码正确
                req.session.admin_id = admin.id;
                res.send({
                    status: 1,
                    success: '登录成功',
                    username
                })
            } else {
                res.send({
                    status: -1,
                    message: '该用户已存在，密码输入错误',
                })
            }
        } catch (err) {
            console.log('管理端登录失败', err);
            res.send({
                status: -1,
                message: '管理端登录失败',
            })
        }

    }

    //前台退出登录
    async logout(req, res, next) {
        try {
            delete req.session.admin_id;
            delete req.session.user_id;
            res.send({
                status: 1,
                success: '退出成功'
            })
        } catch (err) {
            console.log('退出失败', err)
            res.send({
                status: -1,
                message: '退出失败'
            })
        }
    }

    //新增收货地址
    async add_address(req, res, next) {
        let data = req.body;
        try {
            const address_id = await this.getId('address_id');
            let address_data = {
                ...data,
                id: address_id,
                user_id: req.session.user_id || 2
            }
            await new AddressModel(address_data).save();
            res.send({
                status: 1,
                success: '添加收货地址成功'
            })
        } catch (err) {
            console.log('添加收货地址失败', err);
            res.send({
                status: -1,
                type: 'ADD_ADDRESS_FAILED',
                message: '添加收货地址失败',
            })
        }
    }

    //获取收货地址
    async get_address(req, res, next) {
        try {
            let address = await AddressModel.find({user_id: 2});
            res.send({
                status: 1,
                address: address,
                message: '获取地址成功'
            })
        } catch (err) {
            console.log('获取收货地址失败', err);
            res.send({
                status: -1,
                message: '获取收货地址失败',
            })
        }
    }

    encryption(password) {
        const md5password = this.Md5(this.Md5(password));
        return md5password
    }



    Md5(password) {
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }



    //获取用户信息
    async user_info(req, res, next) {
        try {
            let user_info = await AdminModel.findOne({}, 'username id avatar status create_time');
            res.send({
                status: 1,
                data: user_info,
                message: '获取用户信息成功'
            })
        } catch (err) {
            console.log('获取用户信息失败', err);
            res.send({
                status: -1,
                message: '获取用户信息失败'
            })
        }
    }

    //更改头像
    async change_avatar(req, res, next) {
        let {pic_url} = req.body;
        try {
            if (!pic_url)
                throw new Error('更改头像出错，参数有误');
        } catch (err) {
            console.log('更改头像出错,参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        try {
            await AdminModel.update({username: 'guozewei'}, {avatar: pic_url});
            res.send({
                status: 1,
                message: '更改头像成功'
            })
        } catch (err) {
            console.log('更改头像失败', err);
            res.send({
                status: -1,
                message: '更改头像失败'
            })
        }
    }

    //用户信息
    async userStatistic(req, res, next) {
        let {limit = 10,offset=0} = req.query;
        try {
            let data = await AdminModel.find({status:2}, 'username create_time city -_id').limit(limit).skip(offset * limit);
            res.send({
                status: 1,
                message: '获取用户数据成功',
                data
            })
        } catch (err) {
            console.log('获取用户数据失败', err);
            res.send({
                status: -1,
                message: '获取用户数据失败'
            })
        }
    }


}

export default new Admin();