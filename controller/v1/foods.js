import FoodModel from '../../models/v1/foods'
import CategoryModel from '../../models/v1/category'
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
        try {
            if (!category_name || !restaurant_id) {
                throw new Error('添加食物分类失败')
            }
        } catch (err) {
            console.log('添加食物分类失败,参数有误', err);
            res.send({
                status: -1,
                message: err.message
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
        // console.log('category_id',category_id)
        try {
            let category = await new CategoryModel(category_data);
            await category.save();
            res.send({
                status: 1,
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
        let {restaurant_id, category_id, food_name, min_price, description, picture, skus} = req.body;
        try {
            if (!restaurant_id || !category_id || !food_name) {
                throw new Error('添加食物失败，参数有误!');
            }
        } catch (err) {
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        try {
            for (let i = 0; i < skus.length; i++) {
                let sku_id = await this.getId('sku_id');
                skus[i]['id'] = sku_id;
            }
            let month_saled = Math.ceil(Math.random() * 50);  //随机生成一个月售数量
            let food_id = await this.getId('food_id');
            let food_data = {
                id: food_id,
                restaurant_id,
                category_id,
                name: food_name,
                praise_num: Math.ceil(Math.random() * 50),      //点赞数量
                praise_content: '好吃',    //点赞内容
                month_saled,
                month_saled_content: `${month_saled}`,
                min_price,
                description,
                picture,
                skus
            }
            let food = new FoodModel(food_data);
            let addFoods = await food.save();
            let category = await CategoryModel.findOne({id: category_id});
            let updateCategory = category.spus.push(addFoods._id);
            await category.save();
            res.send({
                status: 1,
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
    async delete_food(req, res, next) {
        console.log(req.body)
        let {food_id} = req.body;
        try {
            if (!food_id)
                throw new Error('删除食物失败，参数有误')
        } catch (err) {
            console.log('删除食物失败，参数有误', err)
            return;
        }
       try{
           let food =await FoodModel.findOne({id:food_id});
           // let category = await CategoryModel.findOne({id:food.category_id});
           // let data = category.spus(food._id);
           let category = await CategoryModel.update({id:food.category_id},{$pull:{spus:food._id}});
           await food.remove()
           res.send({
               status:1,
               message:'删除食物成功'
           })
       }catch(err){
            console.log('删除食物失败');
            res.send({
                status:-1,
                message:'删除食物失败'
            })
       }

    }
}

export default new Foods();