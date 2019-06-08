import express from 'express'
import Qiniu from '../controller/v1/qiniu'
import Auth from '../controller/admin/auth'

const router = express.Router();

//七牛云上次凭证
router.get('/uploadtoken', Auth.auth, Qiniu.uploadToken);
export default router;