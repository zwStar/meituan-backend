import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import ShoppingCartModel from '../../models/v1/shoppingCart'
import RestaurantModel from '../../models/v1/restaurant'
import AddressModel from '../../models/admin/address'
import FoodsModel from '../../models/v1/foods'
import AdminModel from '../../models/admin/admin'
class Order extends BaseClass {
    constructor() {
        super();
        this.makeOrder = this.makeOrder.bind(this);
    }

    //下订单修改版
    async makeOrder(req, res, next) {
        let {restaurant_id, foods, address_id = 1, remark} = req.body;
        try {
            if (!restaurant_id && !foods || !address_id)
                throw new Error('下订单失败,参数有误');
        } catch (err) {
            console.log('下订单失败', err);
            res.send({
                status: -1,
                message: '下订单失败，参数有误'
            })
            return;
        }
        try {
            let total_price = 0, order_foods = [];
            let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
            total_price += restaurant.shipping_fee; //加配送费
            for (let i = 0; i < foods.length; i++) {
                let food = await FoodsModel.findOne({'skus.id': foods[i]['skus_id']});

                let sku = food.skus.filter(sku => {
                    return sku.id == foods[i]['skus_id']
                })
                sku = sku[0];
                order_foods.push({
                    name: food['name'],
                    price: sku['price'],
                    num: foods[i]['num'],
                    total_price: Number(sku.price) * Number(foods[i]['num']),
                    spec: sku['spec'],
                    pic_url: food['pic_url']
                })
                total_price += Number(sku.price) * Number(foods[i]['num']);
            }
            // let address = await AddressModel.findOne({id:address_id});
            let user = await AdminModel.findOne({id:req.session.user_id})
            let order_id = await this.getId('order_id');
            let order_data = {
                id: order_id,
                total_price,
                remark,
                user_id: user._id,
                foods: order_foods,
                status: '未支付',
                // address:address._id,
                restaurant: restaurant._id,
                shipping_fee: restaurant.shipping_fee,
            }
            let order = new OrderModel(order_data);
            await order.save();
            res.send({
                status: 1,
                message: '提交订单成功',
                order_id,
                total_price
            })
        } catch (err) {
            console.log('提交订单失败', err);
            res.send({
                status: -1,
                message: '提交订单失败'
            })
        }
    }

    //获取订单列表
    async getOrders(req, res, next) {
        let {offset = 0, limit = 10} = req.query;
        /*session find里面的内容user_id:req.session.admin_id*/
        try {
            let orders = await OrderModel.find({}, '-_id').limit(Number(limit)).skip(Number(offset)).populate([
                {path: 'restaurant'}
            ]);
            orders.map(async (el) => {

                if (el.status !== '支付完成') {
                    let fifteen_minutes = 60 * 15;
                    if (Math.floor(new Date().getTime() / 1000) - el.create_time_timestamp >= fifteen_minutes) {
                        el.status = '超过支付期限'
                        el.pay_remain_time = 0;
                    } else {
                        el.pay_remain_time = new Date().getTime() + fifteen_minutes - new Date().getTime() / 1000;
                    }
                    await el.save();
                    return el;
                }
            })

            res.send({
                status: 1,
                data: orders,
                message: '获取我的订单成功'
            })
        } catch (err) {
            console.log('获取订单列表失败', err);
            res.send({
                status: -1,
                message: '获取订单列表失败'
            })
        }
    }

    //获取指定订单信息
    async getOrder(req, res, next) {
        const order_id = req.params.order_id;
        try {
            if (!order_id)
                throw new Error('获取指定订单失败，参数有误');
        } catch (err) {
            console.log('获取指定订单失败，参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        try {
            let order = await OrderModel.findOne({id: order_id}).populate(
                [{path: 'restaurant'}, {path: ' address'}]);

            if (order.status !== '支付完成') {
                let fifteen_minutes = 60 * 15;
                if (Math.floor(new Date().getTime() / 1000) - order.create_time_timestamp >= fifteen_minutes) {
                    order.status = '超过支付期限'
                    order.pay_remain_time = 0;
                } else {
                    console.log('order.create_time_timestamp', order.create_time_timestamp)
                    console.log('fifteen_minutes', fifteen_minutes)
                    console.log(' new Date().getTime()', Math.floor(new Date().getTime() / 1000))
                    console.log('order.create_time_timestamp + fifteen_minutes - new Date().getTime()', order.create_time_timestamp + fifteen_minutes - Math.floor(new Date().getTime() / 1000))
                    order.pay_remain_time = Number(order.create_time_timestamp) + Number(fifteen_minutes) - Math.floor(new Date().getTime() / 1000)
                }
                await order.save();
            }
            res.send({
                status: 1,
                data: order,
                message: '获取指定订单成功'
            })
        } catch (err) {
            console.log('获取指定订单失败', err);
            res.send({
                status: -1,
                message: '获取指定订单失败'
            })
        }
    }



}

export default new Order();