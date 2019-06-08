import BaseClass from '../../prototype/baseClass'
import AdminModel from '../../models/admin/admin';
import OrderModel from '../../models/v1/order'
import CommentModel from '../../models/v1/comment'
import RestaurantModel from '../../models/v1/restaurant'
import moment from 'moment';

class Comment extends BaseClass {
  constructor() {
    super();
    this.makeComment = this.makeComment.bind(this);
  }

  //评论
  async makeComment(req, res, next) {
    let {order_id, comment_data, food_score = 0, delivery_score = 0, quality_score = 0, pic_url = []} = req.body;
    if (!order_id || !comment_data) {
      res.send({
        status: -1,
        message: '评论失败，参数有误'
      });
      return;
    }
    try {
      let order = await OrderModel.findOne({id: order_id}, '-_id').populate([
        {path: 'restaurant'}, {path: 'user_id'}]);

      //判断订单能否评价
      let user = await AdminModel.findOne({id: order.user_id.id});
      let user_id = req.session.user_id;
      if (user.id !== user_id || order.code !== 200) {
        res.send({
          status: -1,
          message: '评价失败，该订单不能评论!'
        });
        return;
      }
      console.log('user', user);
      let comment_id = await this.getId('comment_id');
      let data = {
        user_id,
        id: comment_id,
        user_name: user.username,
        avatar: user.avatar,
        restaurant_id: order.restaurant.id,
        restaurant: order.restaurant._id,
        pic_url: JSON.parse(pic_url),
        comment_data,
        order_id,
        food_score,
        delivery_score
      };
      console.log('data', data);
      let comment = await new CommentModel(data).save();
      /*修改商品评分begin*/
      let restaurant = order.restaurant;
      let comment_number = restaurant.comment_number;
      restaurant.wm_poi_score = ((restaurant.wm_poi_score * comment_number + food_score ) / (comment_number + 1)).toFixed(1);
      restaurant.delivery_score = ((restaurant.delivery_score * comment_number + delivery_score) / (comment_number + 1)).toFixed(1);
      restaurant.comment_number++;
      await restaurant.save();
      /*修改商品评分end*/
      /* order.has_comment =  !order.has_comment;
       await order.save();*/
      await OrderModel.update({id: order_id}, {has_comment: true});
      res.send({
        status: 200,
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

  // 后台添加评论
  async _makeComment(req, res, next) {
    let comment = req.body.comment;
    for (var i = 0; i < comment.length; i++) {
      let comment_data = new CommentModel(comment[i]);
      await comment_data.save();
    }
    res.send({
      status: 1
    })
  }

  //获取餐馆评论
  async getComment(req, res, next) {
    let {restaurant_id, offset = 0, limit = 5} = req.query;
    if (!restaurant_id) {
      res.send({
        status: -1,
        message: '获取餐馆评论失败，参数有误！'
      });
      return;
    }
    try {
      let comments = await CommentModel.find({restaurant_id}, '-_id').skip(offset * limit).limit(Number(limit)).sort({'comment_time': -1});
      res.send({
        status: 200,
        message: '获取餐馆评论成功',
        data: comments
      })
    } catch (err) {
      console.log('获取餐馆评论失败', err);
      res.send({
        status: -1,
        message: '获取餐馆评论失败'
      })
    }
  }

  //获取我的评论
  async myComment(req, res, next) {
    try {
      let comments = await CommentModel.find({user_id: req.session.user_id}).populate({path: 'restaurant'});
      res.send({
        status: 200,
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
  async myRestaurantComment(req, res, next) {
    let user_id = req.session.admin_id;
    try {
      let restaurant = await RestaurantModel.findOne({user_id});
      if (!restaurant) {
        res.send({
          status: -1,
          message: '没有餐馆'
        });
        return false;
      }
      let comments = await CommentModel.find({restaurant_id: restaurant.id}, '-_id').sort({_id: -1});

      for (let i=0;i<comments.length;i++) {
        comments[i] = comments[i].toObject();
        let order = await OrderModel.findOne({id: comments[i].order_id}).populate(
          [{path: 'restaurant'}, {path: 'address'}]);
        comments[i].order = order;
        comments[i].comment_time = moment(comments[i].comment_time).format('YYYY-MM-DD');
      }

      res.send({
        status: 200,
        message: '获取我的餐馆评论成功',
        data: comments,
      })
    } catch (err) {
      console.log('获取我的餐馆用户评论失败', err);
      res.send({
        status: -1,
        message: '获取我的餐馆用户评论失败'
      });
    }
  }


  //商家回复评论
  async replyComment(req, res, next) {
    let {content, comment_id} = req.body;
    if (!content || !comment_id) {
      res.send({
        status: -1,
        message: '回复评论有误，参数有误!'
      });
      return;
    }
    let comments = await CommentModel.findOne({id: comment_id});
    comments.add_comment_list.push({content});
    await comments.save();
    res.send({
      status: 200,
      message: '回复评论成功'
    })
  }

  //获取店铺评论数
  async commentCount(req, res, nexy) {
    let {restaurant_id} = req.query;
    if (!restaurant_id) {
      res.send({
        status: -1,
        message: '获取评论数量失败，参数有误!'
      })
      return;
    }
    try {
      let restaurant = await RestaurantModel.findOne({id: restaurant_id}, '-_id');
      res.send({
        status: 200,
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

  async deleteComment(req, res, next) {
    let {id} = req.body;
    if (!id) {
      res.send({
        status: -1,
        message: '删除评论失败，参数有误'
      })
      return
    }
    try {
      let result = await CommentModel.remove({id, user_id: req.session.user_id});
      if (result) {
        res.send({
          status: 200,
          message: '删除成功'
        })
      } else {
        res.send({
          status: -1,
          message: '删除失败'
        })
      }
    } catch (err) {
      console.log('删除评论失败', err);
      res.send({
        status: -1,
        message: '删除评论失败'
      })
    }
  }
}

export default new Comment();