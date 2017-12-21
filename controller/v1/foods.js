import restaurantModel from '../../models/v1/restaurant'
import foodSpuTagsModel from '../../models/v1/food_spu_tags'
import foodSpuModel from '../../models/v1/food_spu'
import foodSpuSkuModel from '../../models/v1/food_spu_sku'

import BaseClass from "../../prototype/baseClass";

class Foods extends BaseClass {
    constructor() {
        super();
        this.getRestaurant = this.getRestaurant.bind(this);
    }

    //获取指定id的商家
    async getRestaurant(req, res, next) {
        let {restaurant_id} = req.query;
        try {
            let restaurant_data = await restaurantModel.findOne({id: restaurant_id})

            let data = {};

            let {
                id, name, shipping_time, shipping_fee, avg_delivery_time, min_price, bulletin, discounts2, app_delivery_tip, wm_poi_score, poi_back_pic_url, pic_url,
                shipping_fee_tip, min_price_tip, delivery_time_tip
            } = restaurant_data;
            let poi_info = {
                id,
                name,
                shipping_time,
                shipping_fee,
                avg_delivery_time,
                min_price,
                bulletin,
                discounts2,
                app_delivery_tip,
                wm_poi_score,
                poi_back_pic_url,
                pic_url,
                shipping_fee_tip,
                min_price_tip,
                delivery_time_tip
            };
            data['poi_info'] = poi_info;        //店家信息
            data['food_spu_tags'] = [];     //商品列表
            let tags = await foodSpuTagsModel.find({restaurant_id});    //找到该商店所有分类信息
            for(let i=0;i<tags.length;i++){
                data['food_spu_tags'][i] = {...tags[i]._doc,spus:[]}    //每一个大类 添加spus属性 因为返回的tags带有mongodb_key 所以要用 ._doc获取关键字

                let spus = await foodSpuModel.find({food_spu_sku_tags_id: tags[i].id}); //在每一个大类中 找到该类下所有商品
                data['food_spu_tags'][i]['spus'] = [];
                for(let j = 0;j<spus.length;j++){
                    data['food_spu_tags'][i]['spus'][j] = {...spus[j]._doc,skus:[]}; //每一件商品添加规格skus这个关键字
                    let skus = await foodSpuSkuModel.find({spu_id: spus[j].id}) //找出该商品的所有规格
                    for(let k=0;k<skus.length;k++){
                        data['food_spu_tags'][i]['spus'][j]['skus'][k] = {...skus[k]._doc}; //循环规格数组  添加到skus数组中
                    }
                }
            }
            if (restaurant_data) {
                res.send({
                    status: 1,
                    data
                })
            }
        } catch (err) {
            console.log(`获取id为${restaurant_id}的商家失败`, err);
            res.send({
                status: -1,
                message: `获取id为${restaurant_id}的商家失败`
            })
        }
    }

    //获取多个商家信息
    async getRestaurants(req, res, next) {
        let query = req.query;
        let pageNum = query.pageNum || 0;
        let limit = query.limit || 10;
        let sort = query.sort || '';
        let data = await restaurantModel.find({}).limit(limit)
        res.send({
            status: 1,
            data
        })
    }
}

export default new Foods();