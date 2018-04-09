import md5 from 'blueimp-md5'
import BaseClass from '../../prototype/baseClass'
import OrderModel from '../../models/v1/order'
import PayModel from '../../models/v1/pay'
import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../../config'

class Pay extends BaseClass {
    constructor() {
        super();
        this.appkey = '55388a820c3644aa8eaef76f9f89ecdb'
        this.appSceret = '8254867c1af642a39f473a2341b91a70'
        this.initPay = this.initPay.bind(this)
        this.payNotice = this.payNotice.bind(this)
    }

    //准备支付
    async initPay(req, res, next) {
        //传入订单 和支付方式
        let {order_id, payType = '1', method = 'trpay.trade.create.scan'} = req.body;
        if (!order_id) {
            res.send({
                status: -1,
                message: '初始化支付失败参数有误'
            })
            return;
        }
        try {
            let pay = await PayModel.findOne({order_id});
            if (pay && pay.code === 200) {
                res.send({
                    status: 302,
                    message: '该订单已完成支付！'
                })
                return;
            }
            if (pay) {      //如果该订单已经提交 但是没有支付 重新初始化订单
                pay.remove();
            }
            let id = await this.getId('pay_id');
            let payuserid = req.session.user_id
            let payData = {
                amount: '1',       //这里都是设置1分钱支付
                tradeName: '外卖订单支付',  //商户自定义订单标题
                outTradeNo: id + '',   //商户自主生成的订单号
                payType: payType,    //支付渠道
                payuserid,            //商家支付id
                notifyUrl: config.notifyUrl, //服务器异步通知
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
                if (result.code !== '0000') {
                    res.send({
                        status: -1,
                        message: '支付接口出错，请更改支付方式'
                    })
                    return;
                }
                await saveDB({method: 'scan', id, order_id, payType})
                res.send({
                    status: 1,
                    data: {...result, ...payData, order_id},
                    message: '获取二维码成功，请扫码支付'
                })
            } else {                                                             //调用app支付
                payData.synNotifyUrl = `${config.synNotifyUrl}/#/order_detail?id=${order_id}`;            //客户端同步跳转
                sign = this.sign(payData);
                payData['sign'] = sign;
                await saveDB({method: 'wap', id, order_id, payType, code: 0});
                res.send({
                    status: 200,
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
        let formData = new FormData();
        for (let key in payData) {
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
        return md5(string).toUpperCase();
    }

    //支付异步通知
    async payNotice(req, res, next) {
        let noticeData = req.body;
        console.log('noticeData', noticeData)
        try {
            let sign = noticeData.sign;
            delete noticeData.sign;
            let verifySign = this.sign(noticeData)
            console.log('verifySign === sign', verifySign === sign)
            if (verifySign === sign && noticeData.status === '2') {
                let pay = await PayModel.findOne({id: noticeData.outTradeNo});
                pay.status = '支付成功';
                pay.code = 200;
                let Order = await OrderModel.findOne({id: pay.order_id});
                Order.status = '支付成功';
                Order.code = 200;
                await pay.save();
                await Order.save();
                res.send(200);
            }
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
            if (pay.code === 200) {
                res.send({
                    status: 200,
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