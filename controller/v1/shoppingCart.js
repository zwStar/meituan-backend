import ShoppingCartModel from '../../models/v1/shoppingCart'
import Address from '../../models/admin/address'
import Restaurant from '../../models/v1/restaurant'
import BaseClass from "../../prototype/baseClass";
import FoodModel from '../../models/v1/foods'
import RestaurantModel from '../../models/v1/restaurant'

class ShoppingCart extends BaseClass {
    constructor() {
        super();
        this.add_shopping_cart = this.add_shopping_cart.bind(this)
        this.reduce_shopping_cart = this.reduce_shopping_cart.bind(this)
    }

    //添加进购物车
    async add_shopping_cart(req, res, next) {
        let {food_id, sku_id} = req.body;
        try {
            let isExit = await ShoppingCartModel.findOne({sku_id}); //看是否已经存在购物车 如果存在 直接数量加一
            if (isExit)
                await ShoppingCartModel.update({id: isExit.id}, {$set: {num: ++isExit.num}});
            //如果商品在购物车中不存在 添加该商品
            else {
                let shopping_cart_id = await this.getId('shopping_cart_id');    //获取id
                let food = await FoodModel.findOne({id: food_id});
                const sku = food.skus.filter((el) => {
                    return el.id == sku_id;
                });
                let data = {
                    restaurant_id:food.restaurant_id,
                    food_id,
                    sku_id,
                    id: shopping_cart_id,
                    name: food.name,
                    price: sku[0].price,
                    spec: sku[0].spec,
                    num: 1,
                    user_id: 1,
                }
                let addShoppingCart = new ShoppingCartModel(data);
                await addShoppingCart.save();
            }
            res.send({
                status: 1,
                message: '添加购物车成功'
            })
        } catch (err) {
            console.log("添加购物车失败", err)
            res.send({
                status: -1,
                message: "添加购物车失败"
            })
        }
    }

    //减少购物车商品
    async reduce_shopping_cart(req, res, next) {
        //如果传restaurant_id表示删除这间店的食物        传sku_id删除某个食物
        let {restaurant_id, sku_id} = req.body;
        try {
            if (!restaurant_id && !sku_id)
                throw new Error('删除购物车失败，参数有误')
        } catch (err) {
            console.log('删除购物车失败', err);
            res.send({
                status: -1,
                message: err.message
            })
        }
        if (restaurant_id) {
            try {
                let shoppingCart = await ShoppingCartModel.find({restaurant_id});
                for(let i=0;i<shoppingCart.length;i++)
                    await shoppingCart[i].remove();
                res.send({
                    status: 1,
                    message: '删除购物车成功'
                })
            } catch (err) {
                console.log('删除某个商店的购物车失败', err);
                res.send({
                    status: -1,
                    message: '删除购物车失败'
                })
            }
        } else {
            try {
                let isExit = await ShoppingCartModel.findOne({sku_id});
                if (isExit) {
                    if (isExit.num > 1)   //获取数量减1
                        await ShoppingCartModel.update({id: isExit.id}, {$set: {num: --isExit.num}});
                    else    //如果数量是1 直接删除该商品
                        await isExit.remove();
                    res.send({
                        status: 1,
                        message: '删除购物车成功'
                    })
                } else {
                    res.send({
                        status: -1,
                        message: '删除失败，该商品已经不在购物车中了'
                    })
                }
            } catch (err) {
                console.log('减少购物车失败', err);
                res.send({
                    status: -1,
                    message: "添加购物车失败"
                })
            }

        }
    }

    //获取购物车信息
    async shopping_cart(req, res, next) {
        //如果没有传restaurant_id 就默认获取全部购物车
        let {restaurant_id} = req.query;
        if (restaurant_id) {
            let shoppingCart = await ShoppingCartModel.find({restaurant_id}, '-_id');
            res.send({
                status: 1,
                data: shoppingCart
            })
        } else {
            let restaurants = await ShoppingCartModel.find({}, '-_id');     //根据user_id找餐馆
            let restaurant_list = restaurants.map(el => {
                return el.restaurant_id;
            })

            /*去重begin*/
            let restaurant_arr = [];    //存放去重后各个餐馆
            let json = {};
            for (let i = 0; i < restaurant_list.length; i++) {
                if (!json[restaurant_list[i]]) {
                    restaurant_arr.push(restaurant_list[i]);
                    json[restaurant_list[i]] = 1;
                }
            }
            console.log('restaurant_arr',restaurant_arr)
            /*去重end*/
            /*根据餐馆找到食物*/
            let shopping_cart_data = [];
            for(let i = 0;i<restaurant_arr.length;i++){
                let data = {};
                let restaurant = await RestaurantModel.findOne({id:restaurant_arr[i]},'-_id');  //餐馆信息
                let foods = await ShoppingCartModel.find({restaurant_id:restaurant_arr[i]}, '-_id -restaurant_id');     //根据user_id找餐馆
                data['restaurant'] = restaurant._doc;
                data['foods'] = foods;
                shopping_cart_data.push(data);
            }
            res.send({
                status: 1,
                data: shopping_cart_data
            })
        }
    }
}


/*//获取订单
async
get_order(req, res, next)
{
    let restaurant_id = req.query.restaurant_id;
    let order_list = await
    shoppingCart.find({restaurant_id})
    let order_data = {};
    let total = 0;          //订单中总价格
    let foodlist = [];
    order_list.forEach(async (list) => {
        let sub_total_price = list.num * list.price;    //计算该商品总价格
        total += sub_total_price;
        let sku = await foodSpuSku.findOne({id: list.id});
        let {picture, origin_price, price, spu_id} = sku;   //在sku中获取这些属性
        let spu = await  foodSpu.findOne({id: sku.spu.id});
        let {name, unit} = spu;     //在spu中获取这些属性
        foodlist.push({...sku, ...spu, ...{count: list.num}, sub_total_price});
    })
    let address_info = await
    Address.findOne({});       //收货地址
    let restaurant = await
    Restaurant.findOne({restaurant_id})  //餐馆信息
    let poi_icon = restaurant.poi_info.pic_url; //商家图片
    let poi_name = restaurant.poi_info.name;    //商家名称
    let app_delivery_tip = restaurant.app_delivery_tip  //配送方式
    let coupon_info_list = [
        {
            "usable": 1,
            "selected_coupon_id": 0,
            "selected_coupon_view_id": "0",
            "description": "美团红包",
            "count_tip": "",
            "type": 0,
            "status_tip": "暂无可用",
            "discount": ""
        }, {
            "usable": 1,
            "selected_coupon_id": 0,
            "selected_coupon_view_id": "0",
            "description": "商家代金券",
            "count_tip": "",
            "type": 1,
            "status_tip": "暂无可用",
            "discount": ""
        }]      //优惠券
    let business_type_list = [
        {
            "title": "美团配送",
            "selected": 1,
            "self_delivery_agree_url": "",
            "type": 0,
            "self_delivery_agree_selected": 0
        }]    //配送方式
    order_data = {
        total,
        foodlist,
        address_info,
        poi_icon,
        poi_name,
        app_delivery_tip,
        coupon_info_list,
        business_type_list,
        coupon_info_list,
        business_type_list
    }
    res.send({
        status: 1,
        message: '获取订单成功',
        data: order_data
    })
}

}*/

export default new ShoppingCart();