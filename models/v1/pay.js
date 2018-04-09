import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const paySchema = new Schema({
    id: Number,			//id
    order_id:Number,   //订单id
    amount: Number,    //金额以分为单位
    status:String,     //支付状态 未支付 和 已支付
    payType:String,    //支付渠道
    create_time:{type:Date,default:new Date()},
    method:String,      //支付方式(扫码或者调起APP)
    payuserid:String,
    code:Number        //支付状态码
})

paySchema.index({id: 1});

const Pay = mongoose.model('Pay', paySchema);


export default Pay
