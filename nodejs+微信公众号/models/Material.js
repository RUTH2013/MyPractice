/**
 *  Material的模型类   干货列表
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var materialsSchema = require('../schemas/materials');

module.exports = mongoose.model('Material',materialsSchema); // 创建模型 Material