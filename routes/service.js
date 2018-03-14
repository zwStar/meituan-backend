import express from 'express'
import Qiniu from '../controller/v1/qiniu'
const router = express.Router();

//七牛云上次凭证
router.get('/uploadtoken',Qiniu.uploadToken);
export default router;