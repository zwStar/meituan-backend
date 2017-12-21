import express from 'express'
import Admin from '../controller/admin/admin'

const router = express.Router()

router.post('/login', Admin.login);     //登录
router.post('/logout', Admin.logout);   //退出
router.post('/address',Admin.add_address);      //添加收货地址
router.get('/address',Admin.get_address)

export default router;