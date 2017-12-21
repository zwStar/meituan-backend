import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: String,	//用户名
    password: String,	//密码
    id: Number,			//id
    create_time: String,	//创建日期
    admin: {type: String, default: '管理员'},
    status: Number,  //1:普通管理、 2:超级管理员
    avatar: {type: String, default: 'default.jpg'},	//头像图片
    city: String,	//城市
    address:[]
})

adminSchema.index({id: 1});

const Admin = mongoose.model('Admin', adminSchema);


export default Admin
