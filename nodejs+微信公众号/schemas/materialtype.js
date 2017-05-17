/**
 *  分类的表结构  干货类型
 */
// 加载mongoose 模板
var mongoose = require('mongoose');

// 分类的表结构
module.exports = new mongoose.Schema({
    // 分类名
    name: {
        type: String,
        default: ''
    },
    // 当前类型  干货的数目
    materialNum: {
        type: Number,
        default: 0,
        min:0
    }

});