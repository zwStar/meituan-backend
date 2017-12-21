import AddressClass from '../../prototype/addressClass'
import crypto from 'crypto'
import AdminModel from '../../models/admin/admin'
import AddressModel from '../../models/admin/address'
import dtime from 'time-formater'

class Admin extends AddressClass{
    constructor(){
        super();
        this.login = this.login.bind(this);
        this.add_address = this.add_address.bind(this);
    }
    async login(req,res,next){
        const {username, password, status = 1} = req.body;
        const md5password = this.encryption(password);
        try{
            const admin = await AdminModel.findOne({username});
            if(!admin){     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就默认以用户输入的用户名和密码创建一个新的账号
                const adminTip = status == 1 ? '管理员' : '超级管理员'  //判断是普通管理员还是超级管理员
                const admin_id = await this.getId('admin_id');
                const cityInfo = await this.guessPosition(req);
                const newAdmin = {          //创建一个新登录记录
                    username,              //用户名
                    password: md5password,  //用户密码
                    id: admin_id,           //用户id
                    create_time: dtime().format('YYYY-MM-DD HH:mm'),    //日期格式化
                    admin: adminTip,            //管理员用户类型
                    status,                     //
                    city: cityInfo.city         //登录城市
                }
                await AdminModel.create(newAdmin)
                req.session.admin_id = admin_id;    //设置session
                res.send({
                    status: 1,
                    success: '注册管理员成功',
                })
            }else if(md5password === admin.password){  //用户输入的账号存在并且密码正确
                req.session.admin_id = admin.id;
                res.send({
                    status: 1,
                    success: '登录成功'
                })
            }else{
                console.log('管理员登录密码错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PASSWORD',
                    message: '该用户已存在，密码输入错误',
                })
            }
        }catch (err){
            console.log('登录管理员失败', err);
            res.send({
                status:-1,
                type: 'LOGIN_ADMIN_FAILED',
                message: '登录管理员失败',
            })
        }

    }

    async logout(req,res,next){
        try{
            delete req.session.admin_id;
            res.send({
                status:1,
                success:'退出成功'
            })
        }catch (err){
            console.log('退出失败', err)
            res.send({
                status: -1,
                message: '退出失败'
            })
        }
    }

    //新增收货地址
    async add_address(req,res,next){
        let data = req.body;
        try{
            const address_id = await this.getId('address_id');
            data = {...data, id:address_id};
            let result = AddressModel.create(data);
            if(result){
                res.send({
                    status:1,
                    success:'添加收货地址成功'
                })
            }
        }catch (err){
            console.log('添加收货地址失败', err);
            res.send({
                status:-1,
                type: 'ADD_ADDRESS_FAILED',
                message: '添加收货地址失败',
            })
        }
    }

    async get_address(req,res,next){
        try{
            let address = await AddressModel.find({});
            res.send({
                status:1,
                address:address,
                message:'获取地址成功'
            })
        }catch (err){
            console.log('获取收货地址失败', err);
            res.send({
                status:-1,
                type: 'GET_ADDRESS_FAILED',
                message: '获取收货地址失败',
            })
        }
    }
    encryption(password){
        const md5password = this.Md5(this.Md5(password));
        return md5password
    }
    Md5(password){
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }
}
export default new Admin();