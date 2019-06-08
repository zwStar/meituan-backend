import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    id: Number,			//id
    user_id: {type: Schema.ObjectId, ref: 'Admin'},     //用户id
    restaurant: {type: Schema.ObjectId, ref: 'Restaurant'},
    restaurant_id: Number,
    total_price: Number,
    foods: [
        {
            foods_id: Number,
            sku_id: Number,
            num: Number,
            price: Number,
            name: String,
            pic_url: String,
            total_price: String,
            spec: String
        }
    ],
    shipping_fee: Number,
    address: {type: Schema.ObjectId, ref: 'Address'},
    remark: String,
    status: String,
    code: Number,    //支付状态码
    create_time: {type: Date, default: new Date()},    //订单创建时间
    confirm: {type: Boolean, default: false},
    create_time_timestamp: {type: String},    //订单创建时间戳
    pay_remain_time: String,         //支付剩余时间
    has_comment: {type: Boolean, default: false}            //是否已经评价该订单了
})

orderSchema.index({id: 1});

const Order = mongoose.model('Order', orderSchema);


export default Order
