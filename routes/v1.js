import express from 'express'
import Cites from '../controller/v1/cites'
import Foods from '../controller/v1/foods'
import Admin from '../controller/admin/admin'
import ShoppingCart from '../controller/v1/shoppingCart'
import Restaurant from '../controller/v1/restaurant'
import Order from '../controller/v1/order'
import Comment from '../controller/v1/comment'
const router = express.Router();

router.get("/suggestion",Cites.suggestion)                //地址位置搜索
router.get("/location",Cites.location);                  //定位
router.get('/restaurants',Restaurant.getRestaurants);        //获取多家餐馆
router.get('/restaurant',Restaurant.getRestaurant);          //获取指定餐馆信息
router.post('/restaurant',Restaurant.addRestaurant);          //添加商家
router.get('/search_restaurant',Restaurant.search_restaurant);  //搜索商家

router.post('/shopping_cart',ShoppingCart.add_shopping_cart);//添加进购物车
router.delete("/shopping_cart",ShoppingCart.reduce_shopping_cart);   //减少购物车
router.get('/shoppingCart',ShoppingCart.shopping_cart);         //获取购物车


router.get('/user_count',Admin.user_count);       //获取当天新增用户数量
/*router.get('/orderCount',Admin.orderCount);     //获取当天新增订单数量
*/

router.get('/all_user_count',Admin.all_user_count);  //获取所有用户数量
router.get('/all_order_count',Order.all_order_count);   //获取所有订单数量

router.post('/category',Foods.addCategory);         //添加食物分类
router.post('/food',Foods.addFood)         //添加食物
router.get('/food',Restaurant.getFoods);         //获取指定餐馆食物列表
router.delete('/food',Foods.delete_food);      //删除食物

//订单
router.post('/order',Order.make_order);         //下订单
router.get('/orders',Order.get_orders);             //获取订单列表
router.get('/order',Order.get_order);             //获取指定订单

//评价
router.post('/comment',Comment.make_comment)
router.get('/comment_count',Comment.commen_count);      //获取评论数量

export default router;
