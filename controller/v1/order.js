import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import RestaurantModel from '../../models/v1/restaurant'
import AddressModel from '../../models/admin/address'
import FoodsModel from '../../models/v1/foods'
import AdminModel from '../../models/admin/admin'

class Order extends BaseClass {
  constructor() {
    super();
    this.makeOrder = this.makeOrder.bind(this);
    this.getOrder = this.getOrder.bind(this);
    this.getOrders = this.getOrders.bind(this);
    this.makeWXOrder = this.makeWXOrder.bind(this);
    this.getMyRestaurantOrder = this.getMyRestaurantOrder.bind(this);
  }

  //下订单
  async makeOrder(req, res, next) {
    let {restaurant_id, foods, address_id, remark = ''} = req.body;
    if (!restaurant_id && !foods && !address_id) {
      res.send({
        status: -1,
        message: '下订单失败，参数有误'
      })
      return
    }
    try {
      let promiseArr = [];
      let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
      promiseArr.push(this._calcTotalPrice(restaurant.shipping_fee, foods));       //计算总价格
      promiseArr.push(AddressModel.findOne({id: address_id}));                       //地址信息
      promiseArr.push(AdminModel.findOne({id: req.session.user_id}));               //用户信息
      promiseArr.push(this.getId('order_id'));                                    //订单号
      Promise.all(promiseArr).then(async (values) => {
        let order_data = {
          total_price: values[0].total_price,
          foods: values[0].order_foods,
          address: values[1]._id,
          user_id: values[2]._id,
          id: values[3],
          remark,
          restaurant_id,
          status: '未支付',
          code: 0,
          restaurant: restaurant._id,
          shipping_fee: restaurant.shipping_fee,
          create_time_timestamp: Math.floor(new Date().getTime() / 1000)
        }
        let order = new OrderModel(order_data);
        await order.save();
        res.send({
          status: 200,
          message: '提交订单成功，请尽快支付',
          order_id: values[3],
          total_price: values[0].total_price,
        })
      });
    } catch (err) {
      console.log('提交订单失败', err);
      res.send({
        status: -1,
        message: '提交订单失败'
      })
    }
  }

  // 下微信订单
  async makeWXOrder(req, res, next) {
    let {restaurant_id, foods, address_id, remark = ''} = req.body;

    if (!restaurant_id && !foods && !address_id) {
      res.send({
        status: -1,
        message: '下订单失败，参数有误'
      });
      return
    }
    try {
      let promiseArr = [];
      foods = JSON.parse(foods);
      let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
      promiseArr.push(this._calcWXTotalPrice(restaurant.shipping_fee, foods));       //计算总价格
      promiseArr.push(AddressModel.findOne({id: address_id}));                       //地址信息
      promiseArr.push(AdminModel.findOne({id: req.session.user_id}));               //用户信息
      promiseArr.push(this.getId('order_id'));                                    //订单号
      Promise.all(promiseArr).then(async (values) => {
        let order_data = {
          total_price: values[0].total_price.toFixed(2),
          foods: values[0].order_foods,
          address: values[1]._id,
          user_id: values[2]._id,
          id: values[3],
          remark,
          restaurant_id,
          status: '已支付',
          code: 200,
          restaurant: restaurant._id,
          shipping_fee: restaurant.shipping_fee,
          create_time_timestamp: Math.floor(new Date().getTime() / 1000)
        };
        let order = new OrderModel(order_data);
        await order.save();
        res.send({
          status: 200,
          order_id: values[3],
          total_price: values[0].total_price.toFixed(2),
        })
      });
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
    try {
      let userInfo = await AdminModel.findOne({id: req.session.user_id});
      console.log(userInfo)
      let orders = await OrderModel.find({
        code: 200,
        user_id: userInfo._id
      }, '-_id').populate([
        {path: 'restaurant'},
        {path: 'address'}
      ]).limit(Number(limit)).sort({create_time_timestamp: -1}).skip(Number(offset));
      res.send({
        status: 200,
        data: orders,
        message: '获取我的订单列表成功'
      })
    } catch (err) {
      console.log('获取订单列表失败', err);
      res.send({
        status: -1,
        message: '获取订单列表失败'
      })
    }
  }

  // 商家获取餐馆订单

  async getMyRestaurantOrder(req, res, next) {
    let {offset = 0, limit = 10} = req.query;
    try {
      let userInfo = await AdminModel.findOne({id: req.session.admin_id});
      let restaurantInfo = await RestaurantModel.findOne({user_id: userInfo.id});
      console.log('userInfo', userInfo);
      let orders = await OrderModel.find({
        code: 200,
        restaurant_id: restaurantInfo.id
      }, '-_id').populate([
        {path: 'restaurant'},
        {path: 'address'}
      ]).limit(Number(limit)).sort({create_time_timestamp: -1}).skip(Number(offset));
      res.send({
        status: 200,
        data: orders,
        message: '获取我的订单列表成功'
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
    if (!order_id) {
      res.send({
        status: -1,
        message: '获取指定订单失败，参数有误!'
      });
      return;
    }
    try {
      let order = await OrderModel.findOne({id: order_id}).populate(
        [{path: 'restaurant'}, {path: 'address'}]);
      if (!order) {
        res.send({
          status: -1,
          message: '该订单不存在'
        })
        return;
      }
      await this._calcRemainTime(order);  //计算剩余时间
      res.send({
        status: 200,
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

  //计算总价格
  async _calcTotalPrice(shipping_fee, foods) {
    let total_price = 0, order_foods = [];
    for (let i = 0; i < foods.length; i++) {
      let food = await FoodsModel.findOne({'skus.id': foods[i]['skus_id']});  //根据sku_id找到food
      let sku = food.skus.filter(sku => {
        return sku.id == foods[i]['skus_id']
      });

      order_foods.push({
        name: food['name'],
        price: sku[0]['price'],
        num: foods[i]['num'],
        total_price: Number(sku[0].price) * Number(foods[i]['num']),
        spec: sku[0]['spec'] || '',
        pic_url: food['pic_url']
      })
      total_price += Number(sku[0].price) * Number(foods[i]['num']).toFixed(2);
    }
    return {total_price, order_foods};
  }

  // 计算总价格
  async _calcWXTotalPrice(shipping_fee, foods) {
    let total_price = 0, order_foods = [];
    for (let i = 0; i < foods.length; i++) {
      let food = await FoodsModel.findOne({'id': foods[i]['id']});  //根据sku_id找到food
      let sku = food.skus;
      console.log('sku', sku);
      order_foods.push({
        name: food['name'],
        price: sku[0]['price'],
        num: foods[i]['num'],
        total_price: Number(sku[0].price) * Number(foods[i]['num']),
        spec: sku[0]['spec'] || '',
        pic_url: food['pic_url']
      });
      total_price += Number(sku[0].price) * Number(foods[i]['num']);
    }
    return {total_price, order_foods};
  }

  //计算剩余支付时间
  async _calcRemainTime(order) {
    if (order.code !== 200) {
      let fifteen_minutes = 60 * 15;      //15分钟转为秒数
      let now = Math.floor(new Date().getTime() / 1000);      //现在时刻
      let order_time = order.create_time_timestamp;       //订单时刻
      if (now - order_time >= fifteen_minutes) {
        order.status = '超过支付期限';
        order.code = 400;
        order.pay_remain_time = 0;
      } else {
        order.pay_remain_time = fifteen_minutes - (now - order_time);
      }
      await order.save();
      return order;
    }
  }

  // 商家确认订单
  async confirmOrder (req, res, next) {
    try {
      let {order_id} = req.body;
      await OrderModel.update({id: order_id}, {confirm: true});
      res.send({
        status: 200,
        message: '确定订单成功'
      })
    }catch (err) {
      res.send({
        status: -1,
        message: '确定订单失败'
      })
    }
  }
}

export default new Order();