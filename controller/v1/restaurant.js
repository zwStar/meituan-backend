import RestaurantModel from '../../models/v1/restaurant'
import BaseClass from "../../prototype/baseClass";
import Category from '../../models/v1/category'     //食物左侧分类
class Restaurant extends BaseClass {
    constructor() {
        super();
        this.addRestaurant = this.addRestaurant.bind(this);
        this.getRestaurants = this.getRestaurants.bind(this);
        this.tencentkey = 'RLHBZ-WMPRP-Q3JDS-V2IQA-JNRFH-EJBHL';
        this.tencentkey2 = 'RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X';
    }

    async addRestaurant(req, res, next) {
        //添加餐厅
        let {name, third_category, pic_url, shopping_time_start, shopping_time_end, min_price, shipping_fee, bulletin, address, call_center} = req.body;

        try {
            if (!name || !third_category || !pic_url || !address || !call_center) {
                throw new Error('必须填写食品类型名称');
            }
        } catch (err) {
            console.log('添加餐馆参数错误', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        const restaurant_id = await this.getId('restaurant_id');
        let shipping_fee_tip = `配送 ￥${shipping_fee}`
        let min_price_tip = `起送 ￥${min_price}`
        let month_sales = Math.ceil(Math.random() * 200)        //月售几笔   为避免都是0 随机生成一个0-200的值
        let restaurant_data = {
            id: restaurant_id,      //餐馆id
            name,                   //餐馆名称
            month_sales,
            month_sales_tip: `月售${month_sales}笔`,
            wm_poi_score: (Math.random() * 5).toFixed(1),      //随机生成评分数
            delivery_score: (Math.random() * 5).toFixed(1),      //随机生成评分数
            quality_score: (Math.random() * 5).toFixed(1),      //随机生成评分数
            pack_score: (Math.random() * 5).toFixed(1),      //随机生成评分数
            delivery_time_tip: '50分钟',
            third_category,
            pic_url,
            shopping_time_start,
            shopping_time_end,
            min_price,
            min_price_tip,
            shipping_fee,
            shipping_fee_tip,
            bulletin,
            address,
            call_center,
            distance: '',
            average_price_tip: '人均20',      //最低价起送提示
            comment_number: 40,                 //评论数量  避免找不到评论  随机生成40条评论
            discounts2: [
                {
                    "promotion_type": 2,
                    "icon_url": "http://p0.meituan.net/xianfu/f8bc8dffdbc805878aa3801a33f563cd1001.png",
                    "info": "满20减18;满45减40;满60减53"
                },
                {
                    "promotion_type": 2,
                    "icon_url": "http://p1.meituan.net/xianfu/9c997ecce6150671b8459738a26f8bd9767.png",
                    "info": "折扣商品7.33折起"
                },
                {
                    "promotion_type": 2,
                    "icon_url": "http://p0.meituan.net/xianfu/019d1bbb1310b1531e6af6172c9a5095581.png",
                    "info": "新用户立减2元,首次使用银行卡支付最高再减3元"
                }
            ],
        }

        let newRestaurant = new RestaurantModel(restaurant_data);
        try {
            await newRestaurant.save();
            res.send({
                status: 1,
                success: '添加餐馆成功',
                restaurant_id
            })
        } catch (err) {
            console.log('保存数据失败');
            res.send({
                status: -1,
                message: '保存数据失败',
            })
        }
    }

    //获取多个餐馆信息
    async getRestaurants(req, res, next) {
        //sort_type 排序 可以传入min_price 最低起送价  shipping_fee 配送费 wm_poi_score 评分 spend 速度
        let {offset = 0, limit = 5, sort_type = '', lng, lat} = req.query;
        try {
            if (!lng || !lat)
                throw new Error('获取餐馆列表失败，参数有误');
        }
        catch (err) {
            console.log('获取餐馆列表失败,参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
        }
        try {
            let restaurants = '';   //餐馆信息
            if (sort_type === 'min_price' || sort_type === 'wm_poi_score' || sort_type === 'shipping_fee') {
                restaurants = await RestaurantModel.find({}).limit(Number(limit)).skip(Number(offset)).sort({sort_type: 1});
                restaurants = await this.get_distance(restaurants, lng, lat);
                res.send({
                    status: 1,
                    message: '获取餐馆列表成功',
                    data: restaurants
                })
            }
            else {
                restaurants = await RestaurantModel.find({}).limit(Number(limit)).skip(Number(offset));
                restaurants = await this.get_distance(restaurants);
                /*根据距离重新排序*/
                res.send({
                    status: 1,
                    message: '获取餐馆列表成功',
                    data: restaurants
                })
            }
        } catch (err) {
            console.log("获取餐馆列表失败", err);
            res.send({
                status: -1,
                message: '获取餐馆失败'
            })
        }
    }

    //获取餐馆信息时计算距离
    async get_distance(restaurants, lng, lat) {
        for (let i = 0; i < restaurants.length; i++) {
            let result = null;
            result = await this.fetch('http://apis.map.qq.com/ws/distance/v1/', {
                from: `${lat},${lng}`,
                to: `${restaurants[i].lat},${restaurants[i].lng}`,
                key: this.tencentkey,
            });
            if (result.status !== 0) {
                result = await this.fetch('http://apis.map.qq.com/ws/distance/v1/', {
                    from: `${lat},${lng}`,
                    to: `${restaurants[i].lat},${restaurants[i].lng}`,
                    key: this.tencentkey2,
                });
            }
            let element = result.result.elements[0];
            let distance = (element.distance / 1000 ).toFixed(1)+ 'km'        //计算距离
            let delivery_time_tip = (element.duration / 60).toFixed(1) + '分钟'
            restaurants[i].distance = distance;
            restaurants[i].delivery_time_tip=delivery_time_tip;
        }
        return restaurants;
    }

    //根据id获取指定餐馆信息
    async getRestaurant(req, res, next) {
        let {restaurant_id} = req.query;
        try {
            if (!restaurant_id) {
                throw new Error('请指定餐馆id');
            }
        } catch (err) {
            console.log('获取指定餐馆失败，参数有误')
            res.send({
                status: -1,
                message: err.message
            })
        }
        try {
            let restaurant_data = await RestaurantModel.findOne({id: restaurant_id});
            res.send({
                status: 1,
                message: '获取指定餐馆信息成功',
                data: restaurant_data
            })
        } catch (err) {
            res.send({
                status: -1,
                message: '获取指定餐馆失败'
            })
        }
    }

    //获取食物列表
    async getFoods(req, res, next) {
        let {restaurant_id} = req.query;
        try {
            if (!restaurant_id) {
                throw new Error('请指定餐馆id');
            }
        } catch (err) {
            console.log('获取指定餐馆失败，参数有误', err)
            res.send({
                status: -1,
                message: err.message
            })
        }
        try {
            let foods = await Category.find({restaurant_id}).populate({
                path: 'spus',
            });
            res.send({
                status: 1,
                message: '获取食物列表成功',
                data: foods
            })
        } catch (err) {
            console.log('获取餐馆食物失败', err);
            res.send({
                status: -1,
                message: err.message
            })
        }
    }

    //根据关键词搜索商家
    async search_restaurant(req, res, next) {
        let {keyword} = req.query;
        try {
            if (!keyword)
                throw new Error('搜索商家失败，参数有误');
        } catch (err) {
            console.log('搜索商家失败，参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
        }
        try {
            let restaurant = await RestaurantModel.find({name:{$regex: keyword, $options: 'i'}});
            res.send({
                status: 1,
                data: restaurant,
                message:'搜索餐馆成功'
            })
        } catch (err) {
            console.log('搜索餐馆失败', err);
            res.send({
                status: -1,
                message: '搜索餐馆失败'
            })
        }
    }
}

export default new Restaurant();