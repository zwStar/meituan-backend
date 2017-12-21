import fetch from 'node-fetch';
import Ids from '../models/ids'

export default class BaseClass{
    constructor(){
        this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'cart_id', 'img_id', 'category_id', 'item_id', 'sku_id', 'admin_id', 'statis_id','shopping_cart_id'];
    }

    async fetch(url = '', data = {}, type = 'GET', resType = 'JSON'){
        type = type.toUpperCase();
        resType = resType.toUpperCase();
        if (type == 'GET') {
            let dataStr = ''; //数据拼接字符串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            });

            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = url + '?' + dataStr;
            }
        }

        let requestConfig = {
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }

        if (type == 'POST') {
            Object.defineProperty(requestConfig, 'body', {
                value: JSON.stringify(data)
            })
        }
        let responseJson;
        try {
            const response = await fetch(url, requestConfig);
            if (resType === 'TEXT') {
                responseJson = await response.text();
            }else{
                responseJson = await response.json();
            }
        } catch (err) {
            console.log('获取http数据失败', err);
            throw new Error(err)
        }
        return responseJson
    }

    //获取id列表
    async getId(type){
        if (!this.idList.includes(type)) {
            console.log('id类型错误');
            throw new Error('id类型错误');
            return
        }
        try{
            const idData = await Ids.findOne(); //获取当前Ids数据
            if(idData[type] === undefined) idData[type] = 0;
            idData[type] ++ ;                     //修改数据
            await idData.save();                //保存数据
            return idData[type];                //返回当前类型id数量
        }catch (err){
            console.log('获取ID数据失败');
            throw new Error(err)
        }
    }

}