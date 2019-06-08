import fetch from 'node-fetch';
import Ids from '../models/ids'
import config from '../config'

export default class BaseClass {
  constructor() {
    this.tencentkey = config.tencentkey;
    this.tencentkey2 = config.tencentkey2;
    this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'category_id', 'sku_id', 'admin_id', 'pay_id', 'comment_id'];
  }

  async fetch(url = '', data = {}, type = 'GET', resType = 'JSON') {
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
      } else {
        responseJson = await response.json();
      }
    } catch (err) {
      console.log('获取http数据失败', err);
      throw new Error(err)
    }
    return responseJson
  }

  //获取id列表
  async getId(type_id) {
    if (!this.idList.includes(type_id)) {
      throw new Error('id类型错误');
      return
    }
    try {
      const idData = await Ids.findOneAndUpdate({}, {'$inc': {[type_id]: 1}});
      return ++idData[type_id];                //返回当前类型id数量*/
    } catch (err) {
      console.log('获取ID数据失败');
      throw new Error(err)
    }
  }

  //根据ip定位定位  只能获取到经纬度和省份城市  不能获取到具体位置 还需要调用下面接口获取具体位置
  async getLocation(req, res, next) {
    let ip = req.ip;
    const ipArr = ip.split(':');                    //切割字符串提取ip
    ip = ipArr[ipArr.length - 1];
    if (process.env.NODE_ENV == 'dev') {    //开发环境
      ip = '113.105.128.251';
    }
    try {
      let result;
      //根据ip地址请求获取数据
      result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
        ip,
        key: this.tencentkey,
      });
      if (result.status !== 0) {
        result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
          ip,
          key: this.tencentkey2,
        })
      }

      //status===0表示请求成功
      if (result.status === 0) {
        const cityInfo = {
          lat: result.result.location.lat,    //纬度
          lng: result.result.location.lng,    //经度
          city: result.result.ad_info.city,
        };
        cityInfo.city = cityInfo.city.replace(/市$/, '');
        return cityInfo;
      } else {
        /* console.log('定位失败', result)
         res.send({
             status: -1,
             message: '定位失败'
         })*/
        return {lat: 23.02067, lng: 113.75179, city: '东莞市'}

      }
    } catch (err) {
      console.log('定位失败', err);
      res.send({
        status: -1,
        message: '定位失败'
      })
    }
  }

  //根据经纬度获取详细地址信息
  async getDetailPosition(location, res, successFn) {
    try {
      if (location) {
        let cityInfo = await this.fetch('http://apis.map.qq.com/ws/geocoder/v1', {
          location: location.lat + ',' + location.lng,
          key: this.tencentkey
        }, 'GET');
        let address = cityInfo.result.address.replace(/^.{2}省.{2}市/, '');
        successFn({
          address,
          location
        });
      }
    } catch (err) {
      console.log('获取位置失败', err);
      res.send({
        status: -1,
        message: '获取定位失败'
      })
    }

  }

  //根据关键词搜索位置
  async locationSearch(keyword) {
    try {
      let reqData = {
        keyword: encodeURI(keyword),
        key: this.tencentkey,
        policy: 1
      }
      let data = await this.fetch('http://apis.map.qq.com/ws/place/v1/suggestion', reqData, "GET");
      return data;
    } catch (err) {
      console.log('搜索位置出错', err);

    }
  }
}