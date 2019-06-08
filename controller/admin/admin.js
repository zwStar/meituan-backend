import BaseClass from '../../prototype/baseClass'
import crypto from 'crypto'
import AdminModel from '../../models/admin/admin'
import AddressModel from '../../models/admin/address'
import Config from '../../config'

class Admin extends BaseClass {
  constructor() {
    super();
    this.userLogin = this.userLogin.bind(this);
    this.adminLogin = this.adminLogin.bind(this);
    this.wechatLogin = this.wechatLogin.bind(this);
    this.addAddress = this.addAddress.bind(this);
    this.addUser = this.addUser.bind(this);
    this.updatePasswd = this.updatePasswd.bind(this);
  }

  //前台登录
  async userLogin(req, res, next) {
    const {username, password} = req.body;
    const md5password = this.encryption(password);
    try {
      const user = await AdminModel.findOne({username, status: 1});

      if (!user) {     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就创建一个新的账号
        const user_id = await this.getId('user_id');
        const cityInfo = await this.getLocation(req, res);
        const createData = {          //创建一个新账号
          username,                   //用户名
          password: md5password,     //用户密码
          id: user_id,                //用户id
          status: 1,                  //1为用户 2为商家
          city: cityInfo.city,         //登录城市
          avatar: 'http://i.waimai.meituan.com/static/img/default-avatar.png'
        };
        await new AdminModel(createData).save();
        req.session.user_id = user_id;    //设置session
        res.send({
          status: 200,
          success: '注册用户并登录成功',
        })
      } else if (md5password === user.password) {  //用户输入的账号存在并且密码正确
        req.session.user_id = user.id;
        res.send({
          status: 200,
          success: '登录成功',
          username: user.username,              //用户名
          avatar: user.avatar      //用户头像
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
  async adminLogin(req, res, next) {
    const {username, password} = req.body;
    const md5password = this.encryption(password);
    try {
      const admin = await AdminModel.findOne({username, status: 2});
      if (!admin) {     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就默认创建一个新的账号
        const admin_id = await this.getId('admin_id');
        const cityInfo = await this.getLocation(req);
        const createData = {          //创建一个新账号
          username,              //用户名
          password: md5password,  //用户密码
          id: admin_id,           //用户id
          status: 2,
          city: cityInfo.city         //登录城市
        }
        let createAdmin = await new AdminModel(createData).save();
        req.session.admin_id = admin_id;    //设置session
        res.send({
          status: 200,
          success: '注册管理端并登录成功',
          username: createAdmin.username,
          avatar: createAdmin.avatar
        })
      } else if (md5password === admin.password) {  //用户输入的账号存在并且密码正确
        req.session.admin_id = admin.id;
        res.send({
          status: 200,
          success: '登录成功',
          username: admin.username,
          avatar: admin.avatar
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

  // 添加用户
  async addUser(req, res, next) {
    const {username, password} = req.body;
    const md5password = this.encryption(password);
    try {
      const admin = await AdminModel.findOne({username, status: 2});
      if (!admin) {
        const admin_id = await this.getId('user_id');
        const createData = {          //创建一个新账号
          username,              //用户名
          password: md5password,  //用户密码
          id: admin_id,           //用户id
          status: 2,
        };
        let createAdmin = await new AdminModel(createData).save();
        res.send({
          status: 200,
          success: '新增用户成功',
          username: createAdmin.username,
          avatar: createAdmin.avatar
        })
      } else {
        res.send({
          status: -1,
          message: '该用户已存在',
        })
      }
    } catch (err) {
      console.log('新增用户失败', err);
      res.send({
        status: -1,
        message: '新增用户失败',
      })
    }
  }

  // 微信端登录
  async wechatLogin(req, res, next) {
    let {code} = req.body;
    // ?appid=APPID&secret=SECRET&js_code=JSCODE&
    try {
      let loginInfo = await this.fetch('https://api.weixin.qq.com/sns/jscode2session', {
        grant_type: 'authorization_code',
        js_code: code,
        appid: Config.wechatAppid,
        secret: Config.wecahatSecret

      }, 'GET');
      let openid = loginInfo.openid;
      let userExit = await this.isUserExit(openid);
      if (!userExit) {
        let createInfo = await this.createUser(openid);
        req.session.user_id = createInfo.id;

        // 首次登录 返回201 提醒前端设置个人信息
        res.send({
          status: 201,
          message: '登录成功'
        })
      } else {
        req.session.user_id = userExit.id;
        res.send({
          status: 200,
          message: '登录成功'
        })
      }


    } catch (err) {
      console.log('err', err);
      res.send({
        status: -1,
        message: '登录失败'
      })
    }
  }

  // 该用户是否存在
  async isUserExit(openid) {
    return await AdminModel.findOne({openid});
  }

  // 创建用户
  async createUser(openid) {
    const user_id = await this.getId('user_id');
    try {
      return await new AdminModel({
        openid,
        status: 1,
        id: user_id
      }).save();
    } catch (err) {
      console.log('创建微信用户失败', err);
    }

  }

  //前台退出登录
  async logout(req, res, next) {
    try {
      delete req.session.admin_id;
      delete req.session.user_id;
      res.send({
        status: 200,
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
  async addAddress(req, res, next) {
    let data = req.body;
    let {name, phone, address, gender, lng, lat} = data;
    if (!name || !phone || !address || !gender || !lng || !lat) {
      res.send({
        status: '-1',
        message: '添加地址失败，参数有误'
      });
      return;
    }
    try {
      const address_id = await this.getId('address_id');
      let addressData = {
        ...data,
        id: address_id,
        user_id: req.session.user_id
      }
      await new AddressModel(addressData).save();
      res.send({
        status: 200,
        success: '添加收货地址成功'
      })
    } catch (err) {
      console.log('添加收货地址失败', err);
      res.send({
        status: -1,
        type: 'ADD_ADDRESS_FAILED',
        message: '添加收货地址失败'
      })
    }
  }

  //获取用户所有收货地址
  async getAllAddress(req, res, next) {
    try {
      let address = await AddressModel.find({user_id: req.session.user_id});
      res.send({
        status: 200,
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

  //获取指定收货地址
  async getAddress(req, res, next) {
    let {address_id} = req.query;
    if (!address_id) {
      res.send({
        status: -1,
        message: '获取指定地址失败，参数有误'
      })
      return;
    }
    try {
      let address = await AddressModel.findOne({id: address_id, user_id: req.session.user_id}, '-_id');
      res.send({
        status: 200,
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

  //删除收货地址
  async deleteAddress(req, res, next) {
    let {address_id} = req.body;
    if (!address_id) {
      res.send({
        status: -1,
        message: '删除地址失败，参数有误'
      })
      return;
    }
    try {
      let address = await AddressModel.update({id: address_id, user_id: req.session.user_id}, {user_id: null});
      res.send({
        status: 200,
        message: '删除收获地址成功'
      })
    } catch (err) {
      console.log('删除收获地址失败', err);
      res.send({
        status: -1,
        message: '删除收获地址失败',
      })
    }
  }

  async updateAddress(req, res, next) {
    let data = req.body;
    let id = data.id;
    if (!id) {
      res.send({
        status: -1,
        message: '更新地址失败，参数有误'
      })
      return;
    }
    try {
      delete data.id;
      let result = await AddressModel.update({id, user_id: req.session.user_id}, data);
      if (result) {
        res.send({
          status: 200,
          success: '更新地址成功'
        })
      } else {
        res.send({
          status: -1,
          message: '更新地址失败'
        })
      }
    } catch (err) {
      console.log('更新地址失败', err);
      res.send({
        status: -1,
        message: '更新地址失败'
      })
    }
  }

  encryption(password) {
    const md5password = this.Md5(this.Md5(password));
    return md5password
  }

  //md5加密
  Md5(password) {
    const md5 = crypto.createHash('md5');
    return md5.update(password).digest('base64');
  }

  //获取用户信息
  async userInfo(req, res, next) {
    try {
      let user_info = await AdminModel.findOne({id: req.session.admin_id}, 'username id avatar status create_time');
      res.send({
        status: 200,
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

  // 设置用户信息
  async setUserInfo(req, res) {
    let user_id = req.session.user_id;
    let user_info = req.body;
    console.log('setUserInfo', user_info);
    try {
      let data = {
        avatar: user_info.avatarUrl,
        username: user_info.nickName && '苏',
        city: user_info.city
      };
      console.log('user_id', user_id);
      console.log('data', data);
      await AdminModel.update({id: req.session.user_id}, data);
      res.send({
        status: 200,
        message: '设置用户信息成功'
      })
    } catch (err) {
      console.log('设置用户信息失败', err);
      res.send({
        status: -1,
        message: '获取用户信息失败'
      })
    }
  }

  //更改头像
  async changeAvatar(req, res, next) {
    let {pic_url} = req.body;
    if (!pic_url) {
      res.send({
        status: -1,
        message: '更改头像失败，参数有误!'
      });
      return;
    }
    try {
      await AdminModel.update({id: req.session.admin_id}, {avatar: pic_url});
      res.send({
        status: 200,
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

  //管理端获取用户数据
  async userStatistic(req, res, next) {
    let {limit = 10, offset = 0} = req.query;
    try {
      let data = await AdminModel.find({status: 2}, 'username create_time city -_id').limit(limit).skip(offset * limit);
      res.send({
        status: 200,
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

  // 修改密码
  async updatePasswd(req, res, next) {
    let {password} = req.body;
    if (!password) {
      res.send({
        status: -1,
        message: '更改密码出错'
      })
    }
    try {
      await AdminModel.update({id: req.session.admin_id}, {password: this.encryption(password)});
      res.send({
        status: 200,
        message: '更改密码成功'
      })
    } catch (err) {
      console.log('更改密码出错');
      res.send({
        status: -1,
        message: '更改密码出错'
      })
      ;
    }
  }
}

export default new Admin();