import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const paySchema = new Schema({
    id: Number,			//id
    order_id:Number,    //订单id
    Money: Number,
    status:String,      //支付状态 未支付 和 已支付
    payChannel:String,  //支付渠道
    create_time:{type:Date,default:new Date()},
    orderNumber:String
})

paySchema.index({id: 1});

const Pay = mongoose.model('Pay', paySchema);


export default Pay
