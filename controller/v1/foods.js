import FoodModel from '../../models/v1/foods';
import CategoryModel from '../../models/v1/category';
import RestaurantModel from '../../models/v1/restaurant';

import BaseClass from "../../prototype/baseClass";

class Foods extends BaseClass {
  constructor() {
    super();
    this.addCategory = this.addCategory.bind(this);
    this.addFood = this.addFood.bind(this);
  }

  //添加食物分类
  async addCategory(req, res, next) {
    //category_name 餐馆名 restaurant_id 餐馆id
    let {category_name, restaurant_id, icon} = req.body;
    if (!category_name || !restaurant_id) {
      res.send({
        status: -1,
        message: '添加食物分类失败,参数有误'
      })
      return;
    }
    let category_id = await this.getId('category_id');
    let category_data = {
      id: category_id,
      name: category_name,
      restaurant_id,
      icon,
      spus: []
    }
    try {
      let category = await new CategoryModel(category_data).save();
      res.send({
        status: 200,
        message: '添加分类成功',
        category_id
      })
    } catch (err) {
      console.log('添加分类失败', err)
      res.send({
        status: -1,
        message: '添加分类失败'
      })
    }
  }

  //添加食物
  async addFood(req, res, next) {
    let {category_id, food_name, min_price, description, pic_url, skus} = req.body;
    if (!category_id || !food_name) {
      res.send({
        status: -1,
        message: '添加食物失败，参数有误!'
      });
      return;
    }
    try {
      let restaurant = await RestaurantModel.findOne({user_id: req.session.admin_id});
      for (let i = 0; i < skus.length; i++) {
        let sku_id = await this.getId('sku_id');
        skus[i]['id'] = sku_id;
      }
      let month_saled = Math.ceil(Math.random() * 50);  //随机生成一个月售数量
      let food_id = await this.getId('food_id');
      let food_data = {
        id: food_id,
        restaurant_id: restaurant.id,
        category_id,
        name: food_name,
        praise_num: Math.ceil(Math.random() * 50),      //点赞数量
        month_saled,
        month_saled_content: `${month_saled}`,
        min_price,
        description,
        pic_url,
        skus
      }
      let addFoods = new FoodModel(food_data).save();
      let category = await CategoryModel.findOne({id: category_id});
      let updateCategory = category.spus.push(addFoods._id);
      await category.save();
      res.send({
        status: 200,
        message: '添加食物成功',
        food_id
      })
    } catch (err) {
      console.log('添加食物失败', err);
      res.send({
        status: -1,
        message: '添加食物失败'
      })
    }
  }

  //删除食物
  async deleteFood(req, res, next) {
    let food_id = req.params.food_id;
    if (!food_id) {
      res.send({
        status: -1,
        message: '删除食物失败，参数有误'
      })
      return;
    }
    try {
      let food = await FoodModel.findOne({id: food_id});
      await CategoryModel.update({id: food.category_id}, {$pull: {spus: food._id}});
      await food.remove()
      res.send({
        status: 200,
        message: '删除食物成功'
      })
    } catch (err) {
      console.log('删除食物失败');
      res.send({
        status: -1,
        message: '删除食物失败'
      })
    }
  }

  // 食物编辑
  async updateFoods(req, res, next) {
    let {foods_id, price, name} = req.body;
    try {
      let food = await FoodModel.findOne({id: foods_id});
      food = food.toObject();
      food.skus[0].price = price;
      await FoodModel.update({id: foods_id}, {$set: {name, skus: food.skus}});
      res.send({
        status: 200,
        message: '更新食物成功'
      })
    } catch (err) {
      console.log('更新食物失败', err);
      res.send({
        status: -1,
        message: '更新食物失败'
      })
    }
  }
}

export default new Foods();