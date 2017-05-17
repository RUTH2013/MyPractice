/**
 *  Comment的模型类   评论
 */

// 加载mongoose 模板
var mongoose = require('mongoose');

// 加载表结构
var commentsSchema = require('../schemas/comments');

module.exports = mongoose.model('Comment',commentsSchema); // 创建模型 Comment