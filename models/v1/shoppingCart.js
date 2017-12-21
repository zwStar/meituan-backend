import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const shoppingCartSchema = new Schema({
    id: Number,			//id
    user_id:Number,     //用户id
    restaurant_id:Number,
    food_id:Number,
    price:Number,
    name:String,
    num:{type:Number,default:0}
})

shoppingCartSchema.index({id: 1});

const Admin = mongoose.model('ShoppingCart', shoppingCartSchema);


export default Admin
