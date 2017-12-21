import BaseClass from './baseClass'

class AddressClass extends BaseClass {
    constructor(){
        super();
        this.tencentkey = 'RLHBZ-WMPRP-Q3JDS-V2IQA-JNRFH-EJBHL';
        this.tencentkey2 = 'RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X';
        this.baidukey = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
        this.baidukey2 = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
    }

    //获取定位地址
    async guessPosition(req){
        return new Promise(async (resolve,reject)=>{
            let ip = req.headers['x-forwarded-for'] ||      //获取ip
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            const ipArr = ip.split(':');                    //切割字符串提取ip
            ip = ipArr[ipArr.length -1];
            if (process.env.NODE_ENV == 'dev') {    //如果是开发环境 ip设置为我本地地址
                ip = '113.105.128.251';
            }
            try{
                let result;
                //向腾讯api请求当前ip的地址
                result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
                    ip,
                    key: this.tencentkey2,
                });

               result = JSON.parse(result);
                //status===0表示请求成功
                if (result.status == 0) {
                    const cityInfo = {
                        lat: result.result.location.lat,    //纬度
                        lng: result.result.location.lng,    //经度
                        city: result.result.ad_info.city,
                    }
                    cityInfo.city = cityInfo.city.replace(/市$/, '');
                    resolve(cityInfo)
                }else{
                    console.log('定位失败', result)
                    reject('定位失败');
                }
            }catch (err){
                reject(err);
            }

        })
    }
}

export default AddressClass;