/**
 *  user数据表结构  用户
 */


// 加载mongoose 模板
var mongoose = require('mongoose');

// 用户的表结构
module.exports = new mongoose.Schema({
    // 用户名
    username: String,
    // 密码
    password: String,
    // 是否是管理员
    isAdmin: {
        type: Boolean,
        default: false
    },
    // 收藏
    collector: [{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Material'  // 要关联的模型
    }],
    // 购买的课程
    course: [{
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Course'  // 要关联的模型
    }],
    openId: {
        type: String,
        default: new Date().getTime().toString()
    },
    headImgUrl: {
        type: String,
        default: '/public/dist/images/main/content/photo.png'
    }

});