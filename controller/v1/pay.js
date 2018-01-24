import BaseClass from '../../prototype/baseClass'
import OrderModel from '../../models/v1/order'
import PayModel from '../../models/v1/pay'
class Pay extends BaseClass {
    constructor() {
        super();
        this.init_pay = this.init_pay.bind(this)
    }
    //准备支付
    async init_pay(req,res,next){
        //传入订单 和支付方式
        let {order_id,pay_channel} = req.body;
        try{
            if(!order_id)
                throw new Error('初始化支付失败参数有误');
        }catch(err){
            console.log('初始化支付失败参数有误',err);
            res.send({
                status:-1,
                message:err.message
            })
            return;
        }
        try{
            let pay = await PayModel.findOne({order_id});
            if(pay)         //如果初始化该订单的支付 移除重新创建
                pay.remove();
            let id = await this.getId('pay_id');
             let pay_data = {
                 Money:1,       //这里都是设置1分钱支付
                 Subject:'外卖订单支付',  //商户自定义订单标题
                 orderNumber:id,   //商户自主生成的订单号
                 payChannel:pay_channel,    //支付渠道
                 payId:10952,            //商家支付id
                 Notify_url:'http://127.0.0.1:5000/notify_url', //服务器异步通知
                 Return_url:'https://www.baidu.com/'            //客户端同步跳转
             }
            let keys = Object.keys(pay_data);
            keys = keys.sort();
            let string = '';
            for(let i=0;i<keys.length;i++){
                string +=data[keys[i]];
            }
            let payKey = 'f3f39d06f2cc8969ba5368c783b6c39b'
            string +=payKey
            let sign = this.md5(string)
            pay_data['sign'] = sign;
            let save_db = {     //存入数据库数据
                id,   //商户自主生成的订单号
                order_id,   //外卖订单的id
                Money:1,       //这里都是设置1分钱支付
                Subject:'外卖订单支付',  //商户自定义订单标题
                payChannel:pay_channel,    //支付渠道
                status:'未支付'
            }
            let int_pay = new PayModel(save_db);
            await init_pay.save();
            res.send({
                status:1,
                data:pay_data,
                message:'初始化支付成功，请扫码支付'
            })
        }catch (err){
            console.log('初始化支付失败',err);
            res.send({
                status:-1,
                message:'初始化支付失败'
            })
        }
    }

    //MD5加密
    Md5(string){
        const md5 = crypto.createHash('md5');
        return md5.update(string).digest('base64');
    }

    //支付异步通知
    async pay_notice(req,res,next){
        let notice_data = req.body;
        try{
            let string = '';        //验证签名
            let payKey = 'f3f39d06f2cc8969ba5368c783b6c39b' //密钥
            let keys = Object.keys(notice_data);
            keys.map((key)=>{
                if(notice_data[key]!=='' && notice_data[key] !=='callbackSign')
                    return true;
            });
            keys = keys.sort();
            keys.forEach(()=>{
                string += notice_data[key];
            })
            string += payKey;
            if(this.Md5(string) === notice_data['callbackSign']){
                let pay = await PayModel.findOne({id:orderNumer});
                pay.satus = '支付成功';
                let Order = await OrderModel.findOne({id:el.order_id});
                Order.status = '支付成功'
                await pay.save();
                await Order.save();
                res.status(200);
            }
        }catch (err){
            console.log('支付失败',err);
        }
    }
}

export default new Pay();