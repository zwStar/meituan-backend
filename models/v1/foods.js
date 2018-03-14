import mongoose from 'mongoose'
import Category from './category'

const Schema = mongoose.Schema;

const foodsSchema = new mongoose.Schema({
    id: Number,
    restaurant_id: Number,      //餐馆id
    category_id:Number,
    name: String,                //姓名
    min_price: Number,          //最低价
    praise_num: Number,         //点赞数量
    praise_content: String,    //点赞内容
    tread_num: Number,
    praise_num_new: Number,
    unit: String,
    description: String,       //描述
    pic_url: String,            //图片
    month_saled: Number,        //月售数量
    month_saled_content: String,    // 月售描述
    status: Number,
    status_description: String,
    status_remind_list: [],
    attrs: [],
    sku_label: String,
    tag: Number,
    sequence: Number,
    promotion_info: String,
    skus: [{
        id:Number,
        spec:String,            //规格描述
        description:String,     //详细描述
        price:String,           //价格
    }],
    created_at:{type:Date,default:new Date()}
});

const Foods = mongoose.model('Foods', foodsSchema);


export default Foods;
