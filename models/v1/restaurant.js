import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const restaurantSchema = new mongoose.Schema({
    id: Number,
    user_id:Number,     //餐馆所属用户id
    name: String,
    pic_url: String,        //店家图片地址
    month_sales:Number,  //月售几笔
    month_sales_tip: String,    //月售几笔
    wm_poi_score: Number,       //商家评分
    delivery_score:Number,      //配送评分
    quality_score:Number,       //质量评论
    food_score:Number,           //口味评分
    pack_score:Number,          //包装评分
    distance: String,       //距离
    delivery_time_tip: String,      //送达时间提示
    shipping_fee_tip: String,    //配送费提示
    min_price_tip: String,      //最低价起送提示
    average_price_tip: String,  //平均费
    third_category: String,        //中式简餐
    discounts2: [],     //折扣
    shipping_time: String,  //经营时间
    shopping_time_start:String,//开始经营时间
    shopping_time_end:String,   //结束经营时间
    shipping_fee: Number,       //配送费
    avg_delivery_time: Number,  //平均送达时间
    min_price: Number,  //最低价起送价格
    bulletin: String,   //公告
    app_delivery_tip: String,   //配送信息提示
    poi_back_pic_url: String,   //头部背景虚拟图
    log_field: {
        poi_type_icon_type: Number,
        recommend_type: Number,
        average_delivery_time: Number,
        search_log_id: String
    },
    comment_number: Number,   //评价数量
    address:String,              //地址
    call_center:String,          //电话
    lng:String,                    //纬度
    lat:String,                     //经度
    created_at:{type:Date,default:new Date()}
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;

