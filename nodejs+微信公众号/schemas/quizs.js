/**
 *  问答 的表结构
 */
// 加载mongoose 模板
var mongoose = require('mongoose');

// 内容的表结构
module.exports = new mongoose.Schema({

    // 关联字段 --- 用户的id
    user:{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'User'  // 要关联的模型
    },

    // 内容标题
    title: String,
    // 内容简介
    description: {
        type: String,
        default: ''
    },
    // 时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 回答
    comments: [{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Comment'  // 要关联的模型
    }]

});