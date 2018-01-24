import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import ShoppingCartModel from '../../models/v1/shoppingCart'
import RestaurantModel from '../../models/v1/restaurant'
import AddressModel from '../../models/admin/address'

class Order extends BaseClass {
    constructor() {
        super();
        this.make_order = this.make_order.bind(this);
    }

    //下订单
    async make_order(req, res, next) {
        //根据restaurant_id或cart_id 下订单，如果 address remark下订单
        let {restaurant_id, cart_id, address_id = 1, remark} = req.body;
        try {
            if (!restaurant_id && !cart_id || !address_id)
                throw new Error('下订单失败,参数有误');
        } catch (err) {
            console.log('下订单失败', err);
            res.send({
                status: -1,
                message: '下订单失败，参数有误'
            })
        }
        try {
            let carts = [], total_price = 0;
            let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
            total_price += restaurant.shipping_fee; //加配送费
            for (let i = 0; i < cart_id.length; i++) {
                let cart = await ShoppingCartModel.findOne({id: cart_id[i]}, '-restaurant_id');
                carts.push(cart);
                total_price += cart.price * cart.num;
            }
            // let address = await AddressModel.findOne({id:address_id});
            let order_id = await this.getId('order_id');
            let order_data = {
                id: order_id,
                total_price,
                remark,
                user_id: req.session.user_id || 1,
                foods: carts,
                status: '未支付',
                // address:address._id,
                restaurant: restaurant._id,
                shipping_fee: restaurant.shipping_fee,
            }
            let order = new OrderModel(order_data);
            await order.save();
            carts.forEach(async el => {
                await el.remove();
            });
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
    async get_orders(req, res, next) {
        let {offset = 0, limit = 10} = req.query;
        /*session find里面的内容user_id:req.session.admin_id*/
        try {
            let orders = await OrderModel.find({}, '-_id').limit(Number(limit)).skip(Number(offset)).populate({
                path: 'restaurant'
            });
            orders.map(async (el) => {
                if (el.status !== '支付完成') {
                    let fifteen_minutes = 1000 * 60 * 15;
                    if (new Date().getTime() - el.create_time_timestamp >= fifteen_minutes) {
                        el.status = '超过支付期限'
                        el.pay_remain_time = 0;
                    } else {
                        el.pay_remain_time = new Date().getTime() + fifteen_minutes - new Date().getTime();
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
    async get_order(req, res, next) {
        let {order_id} = req.query;
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
                [{path: 'restaurant'}, {path:' address'}]);
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

    //获取所有订单数量
    async all_order_count(req, res, next) {
        try {
            let count = await OrderModel.find({status: '支付完成'}).count();
            res.send({
                status: 1,
                message: '获取所有完成订单数量成功',
                data: count
            })
        } catch (err) {
            console.log('获取所有完成订单数量失败', err);
            res.send({
                status: -1,
                message: '获取所有完成订单数量失败'
            })
        }
    }

}

export default new Order();