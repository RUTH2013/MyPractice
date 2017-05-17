/**
 *  Quiz的模型类   问答
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var quizsSchema = require('../schemas/quizs');

module.exports = mongoose.model('Quiz',quizsSchema); // 创建模型 Quiz