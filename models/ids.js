import mongoose from 'mongoose'

const idsSchema = new mongoose.Schema({
    restaurant_id: Number,      //餐馆id
    food_id: Number,            //食物id
    order_id: Number,           //订单id
    user_id: Number,            //用户id
    address_id: Number,         //地址id
    category_id: Number,        //分类id
    sku_id: Number,              //食物规格id
    admin_id: Number,           //管理员id
    pay_id:Number,              //支付id
    comment_id:Number           //评价id
});

const Ids = mongoose.model('Ids', idsSchema);

export default Ids