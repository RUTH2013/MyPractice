/**
 *  course数据表结构  课程
 */


// 加载mongoose 模板
var mongoose = require('mongoose');

// 用户的表结构
module.exports = new mongoose.Schema({
    // 关联字段 --- 用户的id
    user:{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'  // 要关联的模型
    },
    // 课程名
    name: String,
    // 图片地址
    img: String,
    // 价格
    money: {
        type: Number,
        default: 0
    },
    // 报名人员
    peopleNum: [{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'  // 要关联的模型
    }],
    // 课程详情
    details:{
        type: String,
        default: ''
    },
    // 时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 状态
    status: {
        type: Number,
        default: 0   // 0  ： 未上架  1： 已上架 2 : 已下架
    }

});