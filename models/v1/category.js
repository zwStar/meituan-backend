import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    id:Number,
    // tag: String,
    restaurant_id: Number,      //餐馆id
    name:String,
    icon:String,                //icon 图片地址
    /*big_pic_url:String,
    current_page:Number,
    has_next_page:Boolean,
    product_count:Number,
    type:Number,
    selected:Number,
    tag_description:String,
    description:String,
    sequence:Number,
    activity_tag:String,
    tags:[],
    buzType:Number,*/
    spus:[{type:Schema.ObjectId,ref:'Foods'}],
    created_at:{type:Date,default:new Date()}
});

const Category = mongoose.model('Category', categorySchema);



export default Category;
