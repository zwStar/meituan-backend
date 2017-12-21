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

    async suggestion(req, res, next) {
        let query = req.query;
        let reqData = {
            keyword: encodeURI(query.location),
            key: this.tencentkey2,
            policy: 1
        }
        let data = await this.fetch('http://apis.map.qq.com/ws/place/v1/suggestion', reqData, "GET");
        res.send({
                status: 200,
                message: "获取位置信息成功",
                data: data
            }
        )
    }

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
                res.send({
                        status: 200,
                        message: "获取位置信息成功",
                        address: address
                    }
                )
            }else{
                console.log('定位失败', result)
            }
        }catch(err){
            console.log(err);
        }
    }
}

export default new Cites();