/**
 *  前台模块
 */

var express = require('express');
// 创建路由对象
var router = express.Router();

// 引入user模型
var User = require('../models/User');
// 引入Course模型  课程
var Course = require('../models/Course');
// 引入Materialtype模型  干货类型
var Materialtype = require('../models/Materialtype');
// 引入Material模型  干货类型
var Material = require('../models/Material');
// 引入 Quiz 模型  干货类型
var Quiz = require('../models/Quiz');
// 引入 Comment 模型  评论
var Comment = require('../models/Comment');

var wxPayControl = require('./pay.js');

// 监听 以 / 开始的url



// 统一返回格式
var responseData;
router.use(function (req, res, next) {
    // 判断是否是管理员
    if (!req.userInfo._id){
        // res.send('对不起，您不是管理员!');
        // 重定向redirect
        console.log('跳转到网页授权5');
        res.redirect("/oauth/wx_login");//重定向到微信授权
        return;
    }
    responseData= {
        code: 0,
        message: ''
    };
    next();
});

/** 首页 */
router.get('/',function (req,res,next) {   //   / === /
    res.redirect("/course");//重定向到/course
});
/** 课程  */
router.get('/course',function (req,res,next) {   //   /course === /admin/course

    // 已上架的课程
    Course.where({status: 1}).find().sort({_id: -1}).then(function (courses) {
        res.render('main/course_index',{
            userInfo: req.userInfo,
            courses: courses,
            url: 'course'
        });
    });

});
/** 课程 详情 */
router.get('/course/detail',function (req,res,next) {   //   /course === /admin/course

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    Course.findOne({
        _id: id
    }).then(function (course) {
        // console.log(course);
        if (!course){ // 当不存在该分类
            res.render('main/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该课程信息',
                url: '/course'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            res.render('main/course_detail',{
                userInfo: req.userInfo,
                course: course,
                url: 'course'
            });

        }
    });

});
/** 课程 购买 */
router.post('/course/pay',function (req,res) {
    // 获取要收藏的干货的信息， 并且用表单的形式展现出来
    var id = req.body.id || ''; // 课程的id
    var openid = null;


    var notify_url = 'http://wechat.sowdf.com/api/course/notify';
    var spbill_create_ip = "120.24.169.84";
    var total_fee = Number(req.body.money*100)  || 0;　



    var data ={  // 返回的数据
        code: 0
    };

    function MathRand() {
        var Num=""; 
        for(var i=0;i<4;i++) 
        { 
            Num+=Math.floor(Math.random()*10); 
        } 
        return Num;
    }
    var obj = {
        body : "德语学习平台-课程报名", //描述微信支付的意义
        notify_url : notify_url,// 微信付款后的回调地址
        out_trade_no : (new Date().getTime()).toString()+MathRand(),//new Date().getTime(), //订单号
        spbill_create_ip :spbill_create_ip,
        total_fee : total_fee,//金额
        attach: id+","+ req.userInfo._id
    }

    User.findOne({
        _id: req.userInfo._id.toString()
    }).then(function (user) {
        // console.log(user);
        if(!user){
            data.code = 2;
            res.json(data);
            return Promise.reject();
        }
        openid = user.openId;

        Course.findOne({
            _id: id
        }).populate('peopleNum').then(function (course) {
            var isPay = false;  // 判断是否已经报名过了
            for (var j=0; j<course.peopleNum.length; j++){
                console.log(course.peopleNum.length);
                if (course.peopleNum[j]._id == req.userInfo._id) {
                    isPay = true;
                }
            }

            if(isPay){  // 已经报名了
                data.code = 2;
                res.json(data);
                return Promise.reject();
            }else{
                // d调用微信支付
                wxPayControl.getAccessToken(obj,openid,function (wxParam) {
                    data = {
                        wxParam: wxParam,
                        code: 1
                    }
                    res.json(data);
                });
            }
        })

    })

});



router.get('/course/success',function (req,res,next) {
    res.render('main/tip',{
        userInfo: req.userInfo,
        status: 'success',
        message: '报名成功',
         url: '/personal/course?userid='+ req.userInfo._id
    });

});

router.get('/course/waring',function (req,res,next) {
    var id = req.query.id || ''; // 要修改的id
    res.render('main/tip',{
        userInfo: req.userInfo,
        status: 'success',
        message: '已经报名过，不能再次报名',
        url: '/course/detail?id='+ id
    });

});
router.get('/course/error',function (req,res,next) {
    var id = req.query.id || ''; // 要修改的id
    res.render('main/tip',{
        userInfo: req.userInfo,
        status: 'success',
        message: '报名失败，请重试',
        url: '/course/detail?id='+ id
    });

});


/** 干货  */
router.get('/material',function (req,res,next) {   //   /course === /admin/course

    var obj={};
    var materialList=[];

    // 已上架的干货
    Material.where({status: 1}).find().sort({materialtype:1,_id: -1}).populate(['materialtype','user']).then(function (materials) {
        // 显示收藏与否
        // console.log(materials);
        for(var i=0; i<materials.length; i++){
            materials[i].isCollect = false;
            for (var j=0; j<materials[i].collector.length; j++){
                if (materials[i].collector[j] == req.userInfo._id) {
                    materials[i].isCollect = true;
                }
            }
        }
        // 依照类型区分和排列  限制每个分类 显示 6 个
        for(var m=0; m<materials.length; m++){
            var typeId= materials[m].materialtype._id.toString();
            var typeName = materials[m].materialtype.name;
            if (!obj[typeId]){
                obj[typeId]=1;
                materialList.push({
                    typeId: typeId,
                    typeName: typeName,
                    material: [materials[m]]
                });
            }else if ( materialList[materialList.length-1].material.length<6){ // 限制每个分类 显示 6 个
                materialList[materialList.length-1].material.push(materials[m]);
            }
        }

        res.render('main/material_index',{
            userInfo: req.userInfo,
            materialList: materialList,
            url: 'material'
        });
    });

});
/** 干货-按照分类列表  */
router.get('/material/list',function (req,res,next) {   //   /course === /admin/course

    var typeId = req.query.id || ''; // 要修改的id

    // 已上架的干货
    Material.where({status: 1,materialtype: typeId}).find().sort({_id: -1}).populate(['materialtype','user']).then(function (materials) {
        // console.log(materials);
        for(var i=0; i<materials.length; i++){
            materials[i].isCollect = false;
            for (var j=0; j<materials[i].collector.length; j++){
                if (materials[i].collector[j] == req.userInfo._id) {
                    materials[i].isCollect = true;
                }
            }
        }

        res.render('main/material_list',{
            userInfo: req.userInfo,
            materials: materials,
            url: 'material'
        });
    });

});
/** 干货 详情 */
router.get('/material/detail',function (req,res,next) {   //   /course === /admin/course

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    Material.findOne({
        _id: id
    }).then(function (material) {
        if (!material){ // 当不存在该分类
            res.render('main/tip', {
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存当前干货',
                url: '/material'
            });

        }else { // 存在该分类信息

            material.views ++;
            material.save();
            material.isCollect = false;
            for (var j=0; j<material.collector.length; j++){
                if (material.collector[j] == req.userInfo._id) {
                    material.isCollect = true;
                }
            }
            res.render('main/material_detail',{
                userInfo: req.userInfo,
                material: material,
                url: 'material'
            });

        }
    });

});
/** 干货收藏 */
router.get('/material/collect/add',function (req,res) {
    // 获取要收藏的干货的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要收藏的id

    User.update({
        _id: req.userInfo._id.toString()
    },{
        '$addToSet':{'collector':id}
    }).then(function (result) {
        Material.update({
            _id: id
        },{
            '$addToSet':{'collector': req.userInfo._id.toString()}
        }).then(function (result) {
            res.render('main/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '收藏成功',
                url: 'referrer'
            });
        })
    });
});
/** 干货取消收藏 */
router.get('/material/collect/delete',function (req,res) {
    // 获取要收藏的干货的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要收藏的id

    User.update({
        _id: req.userInfo._id.toString()
    },{
        '$pull':{'collector':id}
    }).then(function (result) {
        Material.update({
            _id: id
        },{
            '$pull':{'collector': req.userInfo._id.toString()}
        }).then(function (result) {
            res.render('main/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '取消收藏成功',
                url: 'referrer'
            });
        })

    });
});


/** 问答  */
router.get('/quiz',function (req,res,next) {   //   /course === /admin/course

    var userId = req.query.userid || '';
    var where = {};
    if (userId) {
        where.user = userId
    }

    // 已上架的课程
    Quiz.where(where).find().sort({_id: -1}).populate('user').then(function (quizs) {
        res.render('main/quiz_index',{
            userInfo: req.userInfo,
            quizs: quizs,
            url: 'quiz'
        });
    });

});
/** 搜索问答  */
router.post('/quiz',function (req,res,next) {   //   /course === /admin/course
    var search = req.body.search || '';
    var userId = req.query.userid || '';
    var where = {};
    if (userId) {
        where.user = userId
    }

    // 已上架的课程
    Quiz.where(where).find({
        'title':{$regex: search, $options:'i'}
    }).sort({_id: -1}).populate('user').then(function (quizs) {
        res.render('main/quiz_index',{
            userInfo: req.userInfo,
            quizs: quizs,
            search: search,
            url: 'quiz'
        });
    });

});


/** 知识问答详情 */
router.get('/quiz/detail',function (req,res) {
    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    var populateParams = [
        {
            path: 'user'
        },
        {
            path: 'comments',
            populate: [{
                path: 'user'
            },{
                path: 'quiz'
            },{
                path: 'replies',
                populate: ['user','quiz']
            }]
        }
    ];

    // 获取要修改的信息
    Quiz.findOne({
        _id: id
    }).populate(populateParams).then(function (quiz) {
        // console.log(quiz);
        if (!quiz){ // 当不存在该分类

            res.render('main/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该问答信息',
                url: '/quiz'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            res.render('main/quiz_detail',{
                userInfo: req.userInfo,
                quiz: quiz,
                url: 'quiz'
            });

        }
    });
});
/** 知识问答评论的保存*/
router.post('/quiz/detail',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id
    var isReply = req.body.isReply || '';

    var findQuiz ;

    if (req.body.isReply){
        Comment.findOne({
            _id: isReply
        }).then(function (comment) {
            if (!comment) {  // 当没有要回复的一条评论时
                res.render('main/tip', {
                    userInfo: req.userInfo,
                    status: 'warning',
                    message: '不存在该回答信息',
                    url: '/quiz/detail'
                });
                return Promise.reject();
            }
        });
    }

    // 查询当前这篇内容的信息
    Quiz.findOne({
        _id: id
    }).then(function (quiz) {

        findQuiz = quiz;

        if (req.body.isReply) {
            return new Comment({  /// 保存评论信息
                content: req.body.content,
                user: req.userInfo._id.toString(),
                quiz: quiz._id.toString(),
                addTime: new Date(),
                replies: req.body.isReply
            }).save();


        }else{
            return new Comment({  /// 保存评论信息
                content: req.body.content,
                user: req.userInfo._id.toString(),
                addTime: new Date(),
                quiz: quiz._id.toString()
            }).save();
        }


    }).then(function (newComment) {
        // 在quiz模型中保存评论信息
        findQuiz.comments.push(newComment._id.toString());
        return findQuiz.save();

    }).then(function (newQuiz) {
        if(!newQuiz){
            res.render('main/tip', {
                userInfo: req.userInfo,
                status: 'warning',
                message: '保存信息失败',
                url: '/quiz/detail?id='+ id
            });
        }else{
            res.render('main/tip', {
                userInfo: req.userInfo,
                status: 'success',
                message: '回答保存成功',
                url: '/quiz/detail?id='+ id
            });
        }
    });


});
/** 知识问答 评论的删除 */
router.get('/quiz/detail/commentDelete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id
    var quizId1, quizId2 ;
    var idList = [];
    //
    Comment.findOne({
        _id: id
    }).then(function (comment) {
        quizId1 = comment.quiz;
        return  Comment.remove({// 删除评论
            _id: id
        });
    }).then(function () {
        return Quiz.update({
            _id: quizId1
        },{
            $pull:{comments:id}
        })
    }).then(function () {
        return Comment.find({
            replies: id
        })

    }).then(function (comments) {
        // console.log(comments);
        // idList.push(result._id.toString());
        quizId2 = comments[0].quiz;
        for (var i=0; i< comments.length; i++){
            idList.push(comments[i]._id.toString());
        }
        return Comment.remove({  // 删除评论的回复
            replies: {$in: id}
        });

    }).then(function () {
        return Quiz.update({
            _id: quizId2
        },{
            $pull:{comments:{$in: idList}}
        })
    }).then(function () {
        res.render('main/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '删除成功',
            url: '/quiz/detail?id='+quizId1
        });
    });

});

/** 知识问答添加 */
router.get('/quiz/add',function (req,res) {
    res.render('main/quiz_add',{
        userInfo: req.userInfo,
        url: 'quiz'
    })
});
/** 知识问答添加保存 */
router.post('/quiz/add',function (req,res) {
    // 保存数据到数据库
    new Quiz({
        title: req.body.title,
        description: req.body.description,
        addTime: new Date(),
        user: req.userInfo._id.toString()
    }).save().then(function (result) {
        res.render('main/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '提问成功',
            url: '/quiz'
        });
    });

});


/** 个人 */
router.get('/personal',function (req,res) {
    if(!req.userInfo._id){
        res.redirect("/oauth/wx_login");//重定向到微信授权
        return;
    }
    User.findOne({
        _id: req.userInfo._id
    }).then(function (user) {
        res.render('main/personal_index',{
            userInfo: req.userInfo,
            user: user,
            url: 'personal'
        });
    })
});
/** 个人干货收藏*/
router.get('/personal/material',function (req,res) {
    var userId = req.query.userid || '';
    var materialList = [];

    // 已上架的课程
    Material.find().sort({_id: -1}).populate(['materialtype','user']).then(function (materials) {
        for(var i=0; i<materials.length; i++){
            materials[i].isCollect = false;
            for (var j=0; j<materials[i].collector.length; j++){
                if (materials[i].collector[j] == req.userInfo._id) {
                    materials[i].isCollect = true;
                    materialList.push(materials[i]);
                }
            }
        }
        res.render('main/personal_material',{
            userInfo: req.userInfo,
            materialList: materialList,
            url: 'personal'
        });
    });
});
/** 我的提问  */
router.get('/personal/quiz',function (req,res,next) {   //   /course === /admin/course

    var userId = req.query.userid || '';
    var where = {};
    if (userId) {
        where.user = userId
    }

    // 已上架的课程
    Quiz.where(where).find().sort({_id: -1}).populate('user').then(function (quizs) {
        res.render('main/personal_quiz',{
            userInfo: req.userInfo,
            quizs: quizs,
            url: 'personal'
        });
    });

});
/** 个人购买记录*/
router.get('/personal/course',function (req,res) {
    var userId = req.query.userid || '';
    var courseList = [];

    // 已上架的课程
    Course.find().sort({_id: -1}).populate(['user']).then(function (courses) {
        for(var i=0; i<courses.length; i++){
            for (var j=0; j<courses[i].peopleNum.length; j++){
                if (courses[i].peopleNum[j] == req.userInfo._id) {
                    courseList.push(courses[i]);
                }
            }
        }
        res.render('main/personal_course',{
            userInfo: req.userInfo,
            courseList: courseList,
            url: 'personal'
        });
    });
});

// 返回
module.exports = router ;