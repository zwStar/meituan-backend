import BaseClass from '../../prototype/baseClass'

class Cites extends BaseClass {
    constructor() {
        super();
        this.tencentkey = 'RLHBZ-WMPRP-Q3JDS-V2IQA-JNRFH-EJBHL';
        this.tencentkey2 = 'RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X';
        this.baidukey = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
        this.baidukey2 = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
        this.suggestion = this.suggestion.bind(this);
        this.location = this.location.bind(this);
    }
    //输入地址关键词找位置
    async suggestion(req, res, next) {
        let {keyword} = req.query;
        let reqData = {
            keyword: encodeURI(keyword),
            key: this.tencentkey2,
            policy: 1
        }
        let data = await this.fetch('http://apis.map.qq.com/ws/place/v1/suggestion', reqData, "GET");
        res.send({
                status: 1,
                message: "获取位置信息成功",
                data: data
            }
        )
    }
    //定位当前位置
    async location(req,res,next){
        let ip = req.ip;
        const ipArr = ip.split(':');
        ip = ipArr[ipArr.length -1];
        if (process.env.NODE_ENV == 'dev') {
            ip = '113.105.128.251';
        }
        try{
            let result;
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
            if (result.status == 0) {
                let location = result.result.location;
                let cityInfo = await this.fetch('http://apis.map.qq.com/ws/geocoder/v1',{
                    location:location.lat + ',' + location.lng,
                    key:this.tencentkey
                }, 'GET');
               let address =  cityInfo.result.address.replace('广东省','');
               let data = {         //返回前端的数据
                   address,
                   location
               }
                res.send({
                        status: 1,
                        message: "获取位置信息成功",
                        data
                    }
                )
            }else{
                console.log('定位失败', result)
            }
        }catch(err){
            console.log(err);
            res.send({
                status:-1,
                message:'定位失败'
            })
        }
    }
}

export default new Cites();