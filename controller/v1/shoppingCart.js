import shoppingCart from '../../models/v1/shoppingCart'
import foodSpu from '../../models/v1/food_spu'
import foodSpuSku from '../../models/v1/food_spu_sku'
import foodSpuTags from '../../models/v1/food_spu_tags'
import Address from '../../models/admin/address'
import Restaurant from '../../models/v1/restaurant'
import BaseClass from "../../prototype/baseClass";

class ShoppingCart extends BaseClass {
    constructor() {
        super();
        this.add_shopping_cart = this.add_shopping_cart.bind(this)
        this.reduce_shopping_cart = this.reduce_shopping_cart.bind(this)
        this.get_order = this.get_order.bind(this)
    }

    //添加进购物车
    async add_shopping_cart(req, res, next) {
        let data = req.body;
        try {
            let isExit = await shoppingCart.findOne({restaurant_id: data.restaurant_id, food_id: data.food_id});
            if (isExit) {     //判断该商品是否存在  如果存在 修改数量即可
                await shoppingCart.update({id: isExit.id}, {$set: {num: ++isExit.num}});
            } else {          //商品在购物车中不存在 直接添加该商品
                let shopping_cart_id = await this.getId('shopping_cart_id');    //获取id
                await shoppingCart.create({
                    ...data,
                    id: shopping_cart_id
                });
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
        let data = req.body;
        console.log(data)
        try {
            let isExit = await shoppingCart.findOne({restaurant_id: data.restaurant_id, food_id: data.food_id});
            if (isExit) { //判断该商品是否存在
                if (isExit.num > 1)   //获取数量减1
                    await shoppingCart.update({id: isExit.id}, {$set: {num: --isExit.num}});
                else    //如果数量是1 直接删除该商品
                    await shoppingCart.remove({id: isExit.id});
            }
            res.send({
                status: 1,
                message: "添加购物车成功"
            })
        } catch (err) {
            console.log('减少购物车失败', err);
            res.send({
                status: -1,
                message: "添加购物车失败"
            })
        }
    }

    //获取订单
    async get_order(req, res, next) {
        let restaurant_id = req.query.restaurant_id;
        let order_list = await shoppingCart.find({restaurant_id})
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
        let address_info = await Address.findOne({});       //收货地址
        let restaurant = await Restaurant.findOne({restaurant_id})  //餐馆信息
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
        order_data = {total, foodlist, address_info, poi_icon, poi_name, app_delivery_tip,coupon_info_list,business_type_list,coupon_info_list,business_type_list}
        res.send({
            status: 1,
            message: '获取订单成功',
            data: order_data
        })
    }

}

export default new ShoppingCart();