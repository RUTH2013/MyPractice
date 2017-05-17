/**
 *  user的模型类
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var courseSchema = require('../schemas/course');

module.exports = mongoose.model('Course',courseSchema); // 创建模型 Course