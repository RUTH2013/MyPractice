/**
 *  materialtype 的模型类  干货类型
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var materialtypeSchema = require('../schemas/materialtype');

module.exports = mongoose.model('Materialtype',materialtypeSchema); // 创建模型 Materialtype