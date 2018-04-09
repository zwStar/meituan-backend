import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    id: Number,
    restaurant_id: Number,      //餐馆id
    name: String,
    icon: String,                //icon 图片地址
    spus: [{type: Schema.ObjectId, ref: 'Foods'}],
    created_at: {type: Date, default: new Date()}
});

const Category = mongoose.model('Category', categorySchema);


export default Category;
