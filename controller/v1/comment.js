import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import CommentModel from '../../models/v1/comment'
import RestaurantModel from '../../models/v1/restaurant'
import AddressModel from '../../models/admin/address'
import mongoose from 'mongoose'
class Comment extends BaseClass {
    constructor() {
        super();
        this.makeComment = this.makeComment.bind(this);
    }

    //评论
    async makeComment(req, res, next) {
        let {order_id, name, comment_data, food_score, delivery_score, quality_score, pack_score, pic_url} = req.body;
        try {
            if (!order_id || !comment_data || !food_score || !delivery_score  || !pack_score)
                throw new Error('评论失败，参数有误');
        } catch (err) {
            console.log('评论失败,参数有误', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        try {
            let order = await OrderModel.findOne({id: order_id}).populate({
                path:'restaurant'
            })       //找到该订单
            if(order['status'] !=='支付完成'){
                res.send({
                    status:-1,
                    message:'评价失败，该订单不能评论'
                })
                return;
            }
            let comment_id = await this.getId('comment_id');
            let data = {
                id: comment_id,
                user_id:1,
                user_name:'郭',
                avatar:'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=434294846,2837408119&fm=173&s=4310148AC9BB1E8630B8D5B6030030A1&w=218&h=146&img.JPEG',
                restaurant_id: order.restaurant.id,
                comment_data,
                order_id,
                name,
                food_score,
                delivery_score,
                quality_score,
                pack_score,
                pic_url
            }
            let comment = new CommentModel(data);
            await comment.save();

            /*修改商品评分begin*/
            //let restaurant = await RestaurantModel.findOne({_id: mongoose.Types.ObjectId(order.restaurant_id)});       //获取餐馆 准备修改信息
            let restaurant = order.restaurant;
            let comment_number = restaurant.comment_number;

            restaurant.wm_poi_score = ((restaurant.wm_poi_score * comment_number + food_score )/ (comment_number + 1)).toFixed(1);
            restaurant.delivery_score = ((restaurant.delivery_score * comment_number + delivery_score) / (comment_number + 1)).toFixed(1);
            restaurant.quality_score = ((restaurant.quality_score * comment_number + quality_score )/ (comment_number + 1)).toFixed(1);
            restaurant.pack_score = ((restaurant.pack_score * comment_number + pack_score )/ (comment_number + 1)).toFixed(1);
            restaurant.comment_number++;
            await restaurant.save();
            /*修改商品评分end*/

            order['has_comment'] = true;
            await order.save();
            res.send({
                status: 1,
                message: '评论成功'
            })
        } catch (err) {
            console.log('评论失败', err);
            res.send({
                status: -1,
                message: '评论失败'
            })
        }
    }

    //获取餐馆评论
    async getComment(req, res, next) {
        const restaurant_id = req.params.restaurant_id;
        try {
            let comments = await CommentModel.find({restaurant_id});
            res.send({
                status: 1,
                message: '获取餐馆评论成功',
                data: comments
            })
        } catch (err) {
            console.log('获取商家评价失败', err);
            res.send({
                status: -1,
                message: '获取商家评论失败'
            })
        }
    }

    //获取我的评论
    async myComment(req, res, next) {
        try {
            let comments = await CommentModel.find({});
            res.send({
                status: 1,
                data: comments,
                message: '获取我的评论成功'
            })
        } catch (err) {
            console.log('获取我的评论失败', err);
            res.send({
                status: -1,
                message: '获取我的评论失败'
            })
        }
    }

    //商家获取我的店铺的用户评论
    async myRestaurantComment(req,res,next){
        let {restaurant_id} = req.body;
        //判断传入的餐馆是否为该user的
        let comments = await CommentModel.find({restaurant_id});
        res.send({
            status:1,
            message:'获取评论成功',
            data:comments,
        })
    }

    //商家回复评论
    async replyComment(req,res,next){
        let {content,comment_id} = req.body;
        try{
            throw new Error('回复评论有误，参数有误');
        }catch(err){
            console.log('回复评论有误，参数有误',err);
            res.send({
                status:-1,
                message:err.message
            })
        }
        let comments = await CommentModel.findOne({id:comment_id});
        comments.add_comment_list.push({comment});
        await comments.save();
        res.send({
            status:1,
            message:'回复评论成功'
        })
    }

    //获取店铺评论数
    async commentCount(req, res, nexy) {
        let {restaurant_id} = req.query;
        try {
            if (!restaurant_id)
                throw new Error('获取评论数失败，参数有误');
        } catch (err) {
            console.log('获取评论数量失败', err);
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        try {
            let restaurant = await RestaurantModel.findOne({id:restaurant_id});
            res.send({
                status: 1,
                data: restaurant.comment_number,
                message: '获取评论数量成功'
            })
        } catch (err) {
            console.log('获取评论数量失败', err);
            res.send({
                status: -1,
                message: '获取评论数量失败'
            })
        }

    }
}

export default new Comment();