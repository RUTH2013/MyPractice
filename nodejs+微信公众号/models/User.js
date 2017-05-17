/**
 *  user的模型类
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var usersSchema = require('../schemas/users');

module.exports = mongoose.model('User',usersSchema); // 创建模型 User