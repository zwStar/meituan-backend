import express from 'express'
import Statistic from '../controller/v1/statistic'

const router = express.Router();
router.get('/count/user', Statistic.userCount);       //获取当天新增用户数量
router.get('/count/order', Statistic.orderCount);     //获取当天新增订单数量

router.get('/all/user', Statistic.allUserCount);  //获取所有用户数量
router.get('/all/order', Statistic.allOrderCount);   //获取所有订单数量

router.get('/count/restaurant', Statistic.restaurantCount);      //餐馆数量
export default router;