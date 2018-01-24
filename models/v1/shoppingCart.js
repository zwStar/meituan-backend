import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const shoppingCartSchema = new Schema({
    id: Number,			//id
    user_id:Number,     //用户id
    restaurant_id:Number,
    foods_id:Number,
    sku_id:Number,
    price:Number,
    name:String,
    num:Number,
    spec:String,        //规格描述
    pic_url:String
})

shoppingCartSchema.index({id: 1});

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);


export default ShoppingCart
