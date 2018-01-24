import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    id: Number,			//id
    user_id: Number,     //用户id
    user_name:Number,   //用户名
    avatar:String,          //头像
    restaurant_id:Number,
    comment_time:{type:Date,default:new Date()},
    add_comment_list:[{
        content:String,
        time:{type:Date,default:new Date()}
    }],
    comment:String,
    order_id:Number,
    name:String,
    food_score:Number,
    delivery_score:Number,
    quality_score:Number,
    pack_score:Number,
    pic_url:[]      //图片url

})

commentSchema.index({id: 1});

const Comment = mongoose.model('Comment', commentSchema);


export default Comment
