import mongoose from 'mongoose'

const idsSchema = new mongoose.Schema({
    restaurant_id: Number,      //餐馆id
    food_id: Number,            //食物id
    order_id: Number,           //订单id
    user_id: Number,            //用户id
    address_id: Number,         //地址id
    cart_id: Number,            //优惠券id
    img_id: Number,             //图片id
    category_id: Number,        //分类id
    item_id: Number,
    sku_id: Number,
    admin_id: Number,           //管理员id
    statis_id: Number,
    shopping_cart_id:Number,
    pay_id:Number,           //支付id
    comment_id:Number       //评价id
});

const Ids = mongoose.model('Ids', idsSchema);

//第一次没有数据 进行初始化
Ids.findOne((err, data) => {
    if (!data) {
        const newIds = new Ids({
            restaurant_id: 0,
            food_id: 0,
            order_id: 0,
            user_id: 0,
            address_id: 0,
            cart_id: 0,
            img_id: 0,
            category_id: 0,
            item_id: 0,
            sku_id: 0,
            admin_id: 0,
            statis_id: 0,
            shopping_cart_id:0
        });
        newIds.save();
    }
})
export default Ids