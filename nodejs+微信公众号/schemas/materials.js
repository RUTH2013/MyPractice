/**
 *  干货列表的表结构
 */
// 加载mongoose 模板
var mongoose = require('mongoose');

// 内容的表结构
module.exports = new mongoose.Schema({

    // 关联字段 --- 分类的id
    materialtype:{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Materialtype'  // 要关联的模型
    },

    // 关联字段 --- 用户的id
    user:{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'  // 要关联的模型
    },

    // 内容标题
    title: String,
    // 图片地址
    img: String,
    // 内容简介
    description: {
        type: String,
        default: ''
    },
    // 内容标题
    content:{
        type: String,
        default: ''
    },
    // 时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 收藏者
    collector: [{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'  // 要关联的模型
    }],
    // 是否被收藏
    isCollect: {
        type: Boolean,
        default: false
    },
    // 状态
    status: {
        type: Number,
        default: 0   // 0  ： 未上架  1： 已上架 2 : 已下架
    }

});