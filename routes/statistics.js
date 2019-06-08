import express from 'express'
import Statistic from '../controller/v1/statistic'
import Auth from '../controller/admin/auth'

const router = express.Router();
router.get('/count/user', Auth.authAdmin, Statistic.userCount);       //获取当天新增用户数量
router.get('/count/order', Auth.authAdmin, Statistic.orderCount);     //获取当天新增订单数量

router.get('/all/user', Auth.authAdmin, Statistic.allUserCount);  //获取所有用户数量
router.get('/all/order', Auth.authAdmin, Statistic.allOrderCount);   //获取所有订单数量

router.get('/count/restaurant', Auth.authAdmin, Statistic.restaurantCount);      //餐馆数量

router.get('/my_order', Auth.authAdmin, Statistic.myOrder);
router.get('/my_order_price', Auth.authAdmin, Statistic.myOrderPrice);


export default router;