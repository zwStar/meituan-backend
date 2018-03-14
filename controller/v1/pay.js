import md5 from 'blueimp-md5'
import BaseClass from '../../prototype/baseClass'
import OrderModel from '../../models/v1/order'
import PayModel from '../../models/v1/pay'
import fetch from 'node-fetch';
import FormData from 'form-data';

class Pay extends BaseClass {
    constructor() {
        super();
        this.appkey = 'be6c44e655104d3d90e0d42432eb3c4d'
        this.appSceret = 'ba16f60bbb634a7aa406e883ae92e4a4'
        this.initPay = this.initPay.bind(this)
        this.payNotice = this.payNotice.bind(this)
    }

    //准备支付
    async initPay(req, res, next) {
        //传入订单 和支付方式
        let {order_id, payType = '1', method = 'trpay.trade.create.scan'} = req.body;
        try {
            if (!order_id)
                throw new Error('初始化支付失败参数有误');
        } catch (err) {
            console.log('初始化支付失败参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }

        try {
            let pay = await PayModel.findOne({order_id});
            if (pay)         //如果初始化该订单的支付 移除重新创建
                pay.remove();
            let id = await this.getId('pay_id');
                let payuserid = req.session.user_id
            let payData = {
                amount: '1',       //这里都是设置1分钱支付
                tradeName: '外卖订单支付',  //商户自定义订单标题
                outTradeNo: id + '',   //商户自主生成的订单号
                payType: payType,    //支付渠道
                payuserid,            //商家支付id
                notifyUrl: 'http://119.29.82.47:5050/notify_url', //服务器异步通知
                appkey: this.appkey,          //appKey
                method,
                timestamp: new Date().getTime() + '',
                version: '1.0'
            }
            let sign = ''
            if (method === 'trpay.trade.create.scan') {     //扫码支付
                sign = this.sign(payData);
                payData['sign'] = sign;
                let result = await this.scanPay(res, payData);
                await saveDB({method: 'scan', id, order_id, payType})
                res.send({
                    status: 1,
                    data: {...result, ...payData,order_id},
                    message: '获取二维码成功，请扫码支付'
                })
            } else {              //调用app支付
                payData.synNotifyUrl = 'https://www.baidu.com/';            //客户端同步跳转
                sign = this.sign(payData);
                payData['sign'] = sign;
                await saveDB({method: 'wap', id, order_id, payType})
                res.send({
                    status: 1,
                    data: payData,
                    message: '调用app支付初始化成功'
                })
            }

            async function saveDB(obj) {
                let payType = obj.payType === '1' ? '支付宝' : '微信'
                let
                    save_db = {     //存入数据库数据
                        amount: 1,       //这里都是设置1分钱支付
                        tradeName: '外卖订单支付',  //商户自定义订单标题
                        payType,    //支付渠道
                        status: '未支付',
                        ...obj
                    }
                let init_pay = new PayModel(save_db);
                await init_pay.save();
            }
        } catch (err) {
            console.log('初始化支付失败', err);
            res.send({
                status: -1,
                message: '初始化支付失败'
            })
        }
    }

    //扫码支付
    async scanPay(res, payData) {
        var formData = new FormData();
        for (var key in payData) {
            formData.append(key, payData[key]);
        }
        let result = await fetch('http://pay.trsoft.xin/order/trpayGetWay', {
            method: 'POST',
            body: formData
        })
        return result = await result.json();
    }

    //生成签名
    sign(payData) {
        let keys = Object.keys(payData);
        keys = keys.sort();
        let string = '';
        for (let i = 0; i < keys.length; i++) {
            string = string + keys[i] + '=' + payData[keys[i]] + '&'
        }
        string = string + "appSceret=" + this.appSceret;
        let sign = md5(string).toUpperCase()
        return sign;
    }

    //支付异步通知
    async payNotice(req, res, next) {
        let noticeData = req.body;
        console.log('noticeData', noticeData)
        try {
            let sign = noticeData.sign;
            delete noticeData.sign;
            console.log('noticeData', noticeData);
            let verifySign = this.sign(noticeData)
            if (verifySign === sign) {
                let pay = await PayModel.findOne({id: noticeData.outTradeNo});
                pay.satus = '支付成功';
                let Order = await OrderModel.findOne({id: pay.order_id});
                Order.status = '支付成功'
                await pay.save();
                await Order.save();
                res.status(200);
            }

            /* let string = '';        //验证签名
             let payKey = 'f3f39d06f2cc8969ba5368c783b6c39b' //密钥
             let keys = Object.keys(notice_data);
             keys.map((key) => {
                 if (notice_data[key] !== '' && notice_data[key] !== 'callbackSign')
                     return true;
             });
             keys = keys.sort();
             keys.forEach(() => {
                 string += notice_data[key];
             })
             string += payKey;
             if (this.Md5(string) === notice_data['callbackSign']) {
                 let pay = await PayModel.findOne({id: orderNumer});
                 pay.satus = '支付成功';
                 let Order = await OrderModel.findOne({id: el.order_id});
                 Order.status = '支付成功'
                 await pay.save();
                 await Order.save();
                 res.status(200);
             }*/
        } catch (err) {
            console.log('支付失败', err);
        }
    }

    //扫码支付实时监听
    async listenStatus(req, res, next) {
        let outTradeNo = req.query.outTradeNo;
        try {
            let pay = await PayModel.findOne({id: outTradeNo});
            console.log('pay', pay)
            if (pay.status === '支付完成') {
                res.send({
                    status: 1,
                    message: '支付完成'
                })
            } else {
                res.send({
                    status: -1,
                    message: '未支付'
                })
            }
        } catch (err) {
            console.log('监听扫码状态失败', err);
            res.send({
                status: -1,
                message: '监听状态失败'
            })
        }
    }

}

export default new Pay();