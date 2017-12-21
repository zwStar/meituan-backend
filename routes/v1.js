import express from 'express'
import Cites from '../controller/v1/cites'
import Foods from '../controller/v1/foods'
import ShoppingCart from '../controller/v1/shoppingCart'
const router = express.Router();

router.get("/suggestion",Cites.suggestion)                //定位
router.get("/location",Cites.location);                  //定位
router.get('/restaurants',Foods.getRestaurants);        //获取多家餐馆
router.get('/restaurant',Foods.getRestaurant);          //获取指定餐馆信息

router.post('/shoppingCart',ShoppingCart.add_shopping_cart);//添加进购物车
router.put("/shoppingCart",ShoppingCart.reduce_shopping_cart);   //减少购物车

router.get('order',ShoppingCart.get_order);             //获取订单
export default router;
