/**
 *  后台模块
 */

var express = require('express');
// 创建路由对象
var router = express.Router();// 监听 以 /admin 开始的url


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

// 统一返回格式
var responseData;

router.use(function (req,res,next) {
    // console.log(req.userInfo);
    // 判断是否是管理员
    if (!req.userInfo.isAdmin){
        // res.send('对不起，您不是管理员!');
        // 重定向redirect
        res.redirect("/api/login");//重定向到/admin/usersList
        return;
    }
    responseData= {
        code: 0,
        message: ''
    };
    next();

});


/** 后台首页 */
router.get('/',function (req,res,next) {   //   / === /admin
    res.redirect("/admin/usersList");//重定向到/admin/usersList
});


/** 用户管理  */
router.get('/usersList',function (req,res,next) {
    /**
     * 从数据库中读取用户数据
     *
     * 分页
     *      limit(Number) : 限制获取的数据的条数
     *      skip(2) : 忽略数据的条数（忽略前两条数据）
     *
     *      每页显示2条
     *          1： 1-2 skip：0
     *          2： 3-4 skip：2
     *
     * */
        //req.query 是发送来的url ？ 后面的数据
    var page = Number( req.query.page || 1 ); // 当前页
    var limit = 10; // 每页条数
    var pageNum = 0; // 总页数

    // 获得数据总数
    User.count().then(function (count) {
        // console.log(count);count  // ---> 总条数
        // 计算总页数
        pageNum = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page, pageNum);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;

        User.find().sort({_id: -1}).limit(limit).skip(skip).populate('course').then(function (users) {
            // console.log(users);  // 用户记录
            res.render('admin/usersList',{
                userInfo: req.userInfo,
                users: users,
                url: 'usersList',

                count: count,
                pageNum: pageNum,
                limit: limit,
                page: page
            });
        });


    });


});
/** 用户管理搜索  */
router.post('/usersList',function (req,res,next) {   //   /course === /admin/course
    var search = req.body.search || '';


    User.find({
        'username':{$regex: search, $options:'i'}
    }).sort({_id: -1}).populate('course').then(function (users) {
        res.render('admin/usersList',{
            userInfo: req.userInfo,
            users: users,
            url: 'usersList',
            search: search
        });
    });


});
/** 管理员添加 */
router.get('/usersList/add',function (req,res) {
    res.render('admin/user_add',{
        userInfo: req.userInfo,
        url: 'usersList'
    })
});
/** 添加管理员 保存  */
router.post('/usersList/add',function (req,res) {   //   /user/xxx === /api/user/xxx

    // console.log(req.body); // req.body == > post发生过来的数据
    var username = req.body.username || '';
    var password = req.body.password || '';
    var repassword = req.body.repassword || '';

    // 用户名是否为空
    if (username == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '用户名不能为空',
            url: '/admin/usersList/add'
        });
        return;
    }
    // 密码是否为空
    if (password == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '密码不能为空',
            url: '/admin/usersList/add'
        });
        return;
    }
    // 两次输入密码是否一致
    if (password !== repassword){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '两次输入密码不一致',
            url: '/admin/usersList/add'
        });
        return;
    }
    // 用户名是否已经被注册
    User.findOne({
        username: username  // 查询条件
    }).then(function (userInfo) {
        if( userInfo ){  //查询到结果
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '该用户名已经存在',
                url: '/admin/usersList/add'
            });
            return;
        }
        // 保存用户注册的信息到数据库
        var user = new User({// 通过操作对象来操作数据库
            username: username,
            password: password,
            isAdmin: true
        });
        return user.save(); // 保存

    }).then(function (newUserInfo) {
        // console.log(newUserInfo); // 新注册的信息数据
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '添加管理员成功',
            url: '/admin/usersList'
        });
    });

});
/** 用户管理详情 */
router.get('/usersList/detail',function (req,res) {
    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id


    // 获取要修改的分类信息
    User.findOne({
        _id: id
    }).populate(['course']).then(function (user) {
        if (!user){ // 当不存在该分类
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该用户信息',
                url: '/admin/usersList'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            Course.find({
                _id: {$in: user.course}
            }).then(function (courses) {
                res.render('admin/user_detail', {
                    userInfo: req.userInfo,
                    courses: courses,
                    user: user,
                    url: 'usersList'
                });
            });

        }
    });

});
/** 用户删除 */
router.get('/usersList/delete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id

   
    Course.update({
        _id: id
    },{
        '$pull':{'peopleNum': id}
    }).then(function (result) {
        return Quiz.remove({
            user: id
        })
        
    }).then(function (result) {
        User.remove({
            _id: id
        }).then(function () {
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '用户删除成功',
                url: '/admin/usersList'
            });
        });
    })

    
});


/** 课程管理 */
router.get('/course',function (req,res,next) {
    /**
     * 从数据库中读取用户数据
     *
     * 分页
     *      limit(Number) : 限制获取的数据的条数
     *      skip(2) : 忽略数据的条数（忽略前两条数据）
     *
     *      每页显示2条
     *          1： 1-2 skip：0
     *          2： 3-4 skip：2
     *
     * */
        //req.query 是发送来的url ？ 后面的数据
    var page = Number( req.query.page || 1 ); // 当前页
    var limit = 10; // 每页条数
    var pageNum = 0; // 总页数

    // 获得数据总数
    Course.count().then(function (count) {
        // console.log(count);count  // ---> 总条数
        // 计算总页数
        pageNum = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page, pageNum);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;

        Course.find().sort({_id: -1}).limit(limit).skip(skip).populate(['user','peopleNum']).then(function (courses) {
            // console.log(courses);

            res.render('admin/course_index',{
                userInfo: req.userInfo,
                courses: courses,
                url: 'course',

                count: count,
                pageNum: pageNum,
                limit: limit,
                page: page
            });

        });


    });


});
/** 课程搜索  */
router.post('/course',function (req,res,next) {   //   /course === /admin/course
    var search = req.body.search || '';
    var status = req.body.status;
    var where={};
    if(status!=='all'){
        where={status: status}
    }

    Course.where(where).find({'name':{$regex: search, $options:'i'}}).sort({_id: -1}).populate(['user','peopleNum']).then(function (courses) {
        res.render('admin/course_index',{
            userInfo: req.userInfo,
            courses: courses,
            url: 'course',
            status: status,
            search:search
        });

    });



});
/** 课程管理添加 */
router.get('/course/add',function (req,res) {
    res.render('admin/course_add',{
        userInfo: req.userInfo,
        url: 'course'
    })
});
/** 课程管理添加保存 */
router.post('/course/add',function (req,res) {

    // 保存数据到数据库
    new Course({
        name: req.body.name,
        money: req.body.money,
        img: req.body.img,
        details: req.body.details,
        addTime: new Date(),
        user: req.userInfo._id.toString()
    }).save().then(function (result) {
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '课程保存成功',
            url: '/admin/course'
        });
    });

});
/** 课程管理编辑 */
router.get('/course/edit',function (req,res) {
    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id


    // 获取要修改的分类信息
    Course.findOne({
        _id: id
    }).populate('user').then(function (course) {
        // console.log(course);
        if (!course){ // 当不存在该分类
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该课程信息',
                url: '/admin/course'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            User.find({
                _id: {$in: course.peopleNum}
            }).then(function (users) {
                res.render('admin/course_edit', {
                    userInfo: req.userInfo,
                    course: course,
                    users: users,
                    url: 'course'
                });
            });

        }
    });

});
/** 课程管理编辑的保存*/
router.post('/course/edit',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    // 修改保存
    Course.update({
        _id: id  // 条件
    },{
        name: req.body.name,
        money: req.body.money,
        img: req.body.img,
        details: req.body.details
    }).then(function (result) {
        if (result){ // 修改成功
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '课程修改成功',
                url: '/admin/course/edit?id='+id
            });
        }

    });


});
/** 课程管理删除 */
router.get('/course/delete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id
    User.update({
        _id: id
    },{
        '$pull':{'course': id}
    }).then(function (result) {
        Course.remove({
            _id: id
        }).then(function () {
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '课程删除成功',
                url: '/admin/course'
            });
        });
    })
    
});
/** 课程上架*/
router.post('/course/isPutAway/add',function (req,res) {
    // 内容的id
    var id = req.body.id || '';

    // 查询当前这篇内容的信息
    Course.findOne({
        _id: id
    }).then(function (course) {
        course.status = 1;
        return course.save()
    }).then(function (newCourse) {
        responseData.message = '上架成功';
        // 返回结果
        res.json(responseData);
    });

});
/** 课程下架*/
router.post('/course/isPutAway/cancel',function (req,res) {
    // 内容的id
    var id = req.body.id || '';

    // 查询当前这篇内容的信息
    Course.findOne({
        _id: id
    }).then(function (course) {
        course.status = 2;
        return course.save()
    }).then(function (newCourse) {
        responseData.message = '下架成功';
        // 返回结果
        res.json(responseData);
    });

});


/** 干货类型 */
router.get('/material/type',function (req,res,next) {
        //req.query 是发送来的url ？ 后面的数据
    var page = Number( req.query.page || 1 ); // 当前页
    var limit = 10; // 每页条数
    var pageNum = 0; // 总页数

    var materialNum = 0;
    // 获得当前干货的数目


    // 获得数据总数
    Materialtype.count().then(function (count) {
        // console.log(count);count  // ---> 总条数
        // 计算总页数
        pageNum = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page, pageNum);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;
        // sort() 排序  1：升序  -1：降序
        Materialtype.find().sort({_id:-1}).limit(limit).skip(skip).then(function (materialtypes) {
            // console.log(materialtypes);  // 用户记录
            res.render('admin/material_type',{
                userInfo: req.userInfo,
                materialtypes: materialtypes,
                url: 'material',
                subUrl: '/type',

                count: count,
                pageNum: pageNum,
                limit: limit,
                page: page
            });
        });


    });

});
/** 干货类型添加 */
router.get('/material/type/add',function (req,res) {
    res.render('admin/material_type_add',{
        userInfo: req.userInfo,
        url: 'material'
    });
});
/** 干货类型的保存*/
router.post('/material/type/add',function (req,res) {

    // console.log(req.body); // post 发送的数据
    var name = req.body.name;
    // 判断发送的数据为空
    if (name == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '名称不能为空',
            url: '/admin/material/type'
        });
        return;
    }

    // 数据库中是否已经存在同名分类名称
    Materialtype.findOne({
        name: name
    }).then(function (result) {
        if (result){ // 数据库中已经存在
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '分类名称已经存在了',
                url: '/admin/material/type/add'
            });
            return Promise.reject(); // 不再执行下一个then方法
        }else{ // 数据库中不存在  保存
            return new Materialtype({
                name: name
            }).save();

        }
    }).then(function (newMaterialtype) {
        // 保存成功
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '保存分类名称成功',
            url: '/admin/material/type'
        });

    });

    // 保存

});
/** 干货类型编辑 */
router.get('/material/type/edit',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id


    // 获取要修改的分类信息
    Materialtype.findOne({
        _id: id
    }).then(function (materialtype) {
        if (!materialtype){ // 当不存在该分类
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该分类信息',
                url: '/admin/material/type'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            res.render('admin/material_type_edit',{
                userInfo: req.userInfo,
                materialtype: materialtype,
                url: 'material'
            });

        }
    });

});
/** 干货类型编辑的保存*/
router.post('/material/type/edit',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    var name = req.body.name || '';
    // 判断发送的数据为空
    if (name == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '名称不能为空',
            url: '/admin/material/type'
        });
        return;
    }

    // 获取要修改的分类信息
    Materialtype.findOne({
        _id: id
    }).then(function (materialtype) {
        if (!materialtype){ // 当不存在该分类
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该分类信息',
                url: '/admin/material/type'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            // 要修改的分类名称是否已经在数据库中存在

            if (name == materialtype.name){ // 没有修改直接保存
                res.render('admin/tip',{
                    userInfo: req.userInfo,
                    status: 'success',
                    message: '修改成功',
                    url: '/admin/material/type/edit?id='+id
                });
                return Promise.reject();
            }else {  // 有修改内容
                return Materialtype.findOne({
                    _id: {$ne:id}, // 查询id不一样
                    name: name
                });

            }

        }
    }).then(function (sameMaterialtype) {

        if (sameMaterialtype){// 修改完的名称在数据库中已经存在
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '数据库中已经存在同名分类',
                url: '/admin/material/type/edit?id='+id
            });
            return Promise.reject();
        }else { // 不存在 保存
            return Materialtype.update({
                _id: id  // 条件
            },{
                name: name  // 修改
            });

        }

    }).then(function (result) {
        if (result){ // 修改成功
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '修改成功',
                url: '/admin/material/type'
            });
        }

    });


});
/** 干货类型删除 */
router.get('/material/type/delete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id
    Materialtype.remove({
        _id: id
    }).then(function () {
        return Material.remove({  // 删除该干货类型下面的干货
            materialtype: {$in: id}
        });
    }).then(function () {
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '删除成功',
            url: '/admin/material/type'
        });
    });
});



/** 干货列表 */
router.get('/material',function (req,res) {
    //req.query 是发送来的url ？ 后面的数据
    var page = Number( req.query.page || 1 ); // 当前页
    var limit = 10; // 每页条数
    var pageNum = 0; // 总页数
    var materialtypes;

    // 获得数据总数
    Material.count().then(function (count) {
        // console.log(count);count  // ---> 总条数
        // 计算总页数
        pageNum = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page, pageNum);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;
        // var materialsList ;

        // 读取分类信息
        Materialtype.find().then(function (materialtype) {
            materialtypes= materialtype;
            // sort() 排序  1：升序  -1：降序
            // populate()  显示关联的模型的内容   参数是 表结构里面的关联字段
            return Material.find().sort({addTime:-1}).limit(limit).skip(skip).populate(['materialtype','user'])
        }).then(function (materials) {
            for(var i=0; i<materials.length; i++){
                materials[i].isCollect = false;
                for (var j=0; j<materials[i].collector.length; j++){
                    if (materials[i].collector[j] == req.userInfo._id) {
                        materials[i].isCollect = true;
                    }
                }
            }
            res.render('admin/material_index',{
                userInfo: req.userInfo,
                materialtypes: materialtypes,
                materials: materials,
                url: 'material',

                count: count,
                pageNum: pageNum,
                limit: limit,
                page: page
            });
        });

    });
});
/** 干货搜索  */
router.post('/material',function (req,res,next) {   //   /course === /admin/course
    var search = req.body.search || '';
    var materialType = req.body.materialType;
    var status = req.body.status;
    var where={};
    if(materialType!=='all'&&status!=='all'){
        where={
            materialtype: materialType,
            status: status
        }
    }else if(materialType=='all'&&status!=='all'){
        where={
            status: status
        }
    }else if(materialType!=='all'&&status=='all'){
        where={
            materialtype: materialType
        }
    }
    var materialtypes;


    // 读取分类信息
    Materialtype.find().then(function (materialtype) {
        materialtypes= materialtype;
        // sort() 排序  1：升序  -1：降序
        // populate()  显示关联的模型的内容   参数是 表结构里面的关联字段
        return Material.where(where).find({'title':{$regex: search, $options:'i'}}).sort({addTime:-1}).populate(['materialtype','user'])
    }).then(function (materials) {
        for(var i=0; i<materials.length; i++){
            materials[i].isCollect = false;
            for (var j=0; j<materials[i].collector.length; j++){
                if (materials[i].collector[j] == req.userInfo._id) {
                    materials[i].isCollect = true;
                }
            }
        }
        res.render('admin/material_index',{
            userInfo: req.userInfo,
            materialtypes: materialtypes,
            materials: materials,
            url: 'material',
            materialType: materialType,
            status: status,
            search: search
        });
    });



});
/** 干货添加 */
router.get('/material/add',function (req,res) {
    // 读取分类信息
    Materialtype.find().then(function (materialtype) {
        res.render('admin/material_add',{
            userInfo: req.userInfo,
            url: 'material',

            materialtype: materialtype
        })
    });
});
/** 干货保存 */
router.post('/material/add',function (req,res) {

    // 判断分类名是否为空
    if (req.body.materialType == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '干货分类不能为空',
            url: '/admin/material'
        });
        return;
    }
    // 判断标题是否为空
    if (req.body.title == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '干货标题不能为空',
            url: '/admin/material'
        });
        return;
    }

    // 保存数据到数据库
    new Material({
        materialtype: req.body.materialType,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        img: req.body.img,
        addTime: new Date(),
        user: req.userInfo._id.toString()
    }).save().then(function () {
        return Materialtype.update({
            _id: req.body.materialType
        },{
            $inc:{ materialNum : 1}
        });
    }).then(function (result) {
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '干货保存成功',
            url: '/admin/material'
        });
    });

});
/** 干货编辑 */
router.get('/material/edit',function (req,res) {
    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    var materialType = [];

    // 读取分类信息
    Materialtype.find().then(function (materialtype) {
        materialType = materialtype;
        // 获取要修改的内容信息
        return Material.findOne({
            _id: id
        });
    }).then(function (material) {
        if (!material){ // 当不存在该内容
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '指定干货信息不存在',
                url: '/admin/material'
            });
            return Promise.reject();

        }else { // 存在该内容信息
            // console.log(content);
            res.render('admin/material_edit',{
                userInfo: req.userInfo,
                material: material,
                materialtype: materialType,
                url: 'material'
            });

        }
    });



});
/** 干货编辑的保存*/
router.post('/material/edit',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id

    // 判断分类名是否为空
    if (req.body.materialType == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '干货分类不能为空',
            url: '/admin/material/edit?id='+id
        });
        return;
    }
    // 判断标题是否为空
    if (req.body.title == ''){
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'warning',
            message: '干货标题不能为空',
            url: '/admin/material/edit?id='+id
        });
        return;
    }

    // 修改保存
    Material.update({
        _id: id  // 条件
    },{
        materialtype: req.body.materialType,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        img: req.body.img

    }).then(function (result) {
        if (result){ // 修改成功
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '修改成功',
                url: '/admin/material/edit?id='+id
            });
        }

    });


});
/** 干货删除 */
router.get('/material/delete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id
    var typeId= req.query.typeid || ''; // 要删除的id
    Material.remove({
        _id: id
    }).then(function () {
        return Materialtype.update({
            _id: typeId
        },{
            $inc:{ materialNum : -1}
        })
    }).then(function () {
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '删除成功',
            url: '/admin/material'
        });
    });
});
/** 干货上架*/
router.post('/material/isPutAway/add',function (req,res) {
    // 内容的id
    var id = req.body.id || '';

    // 查询当前这篇内容的信息
    Material.findOne({
        _id: id
    }).then(function (material) {
        material.status = 1;
        return material.save()
    }).then(function (newMaterial) {
        responseData.message = '上架成功';
        // 返回结果
        res.json(responseData);
    });

});
/** 干货下架*/
router.post('/material/isPutAway/cancel',function (req,res) {
    // 内容的id
    var id = req.body.id || '';

    // 查询当前这篇内容的信息
    Material.findOne({
        _id: id
    }).then(function (material) {
        material.status = 2;
        return material.save()
    }).then(function (newMaterial) {
        responseData.message = '下架成功';
        // 返回结果
        res.json(responseData);
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
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '收藏成功',
                url: '/admin/material'
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
            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'success',
                message: '取消收藏成功',
                url: '/admin/material'
            });
        })

    });
});


/** 知识问答 */
router.get('/quiz',function (req,res,next) {
    //req.query 是发送来的url ？ 后面的数据
    var page = Number( req.query.page || 1 ); // 当前页
    var limit = 10; // 每页条数
    var pageNum = 0; // 总页数

    // 获得数据总数
    Quiz.count().then(function (count) {
        // console.log(count);count  // ---> 总条数
        // 计算总页数
        pageNum = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page, pageNum);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;
        // sort() 排序  1：升序  -1：降序
        // populate()  显示关联的模型的内容   参数是 表结构里面的关联字段
        Quiz.find().sort({_id:-1}).limit(limit).skip(skip).populate('user').then(function (quizs) {
            // console.log(quizs);
            res.render('admin/quiz_index',{
                userInfo: req.userInfo,
                quizs: quizs,
                url: 'quiz',

                count: count,
                pageNum: pageNum,
                limit: limit,
                page: page
            });
        });


    });

});
/** 知识问答添加 */
router.get('/quiz/add',function (req,res) {
    res.render('admin/quiz_add',{
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
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '内容保存成功',
            url: '/admin/quiz'
        });
    });

});
/** 知识问答删除 */
router.get('/quiz/delete',function (req,res) {
    // 获取要删除的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要删除的id

    Quiz.remove({
        _id: id
    }).then(function () {
        return Comment.remove({
            quiz: id
        })
    }).then(function () {
        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '删除成功',
            url: '/admin/quiz'
        });
    });
});
/** 知识问答查看 */
router.get('/quiz/edit',function (req,res) {
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

            res.render('admin/tip',{
                userInfo: req.userInfo,
                status: 'warning',
                message: '不存在该问答信息',
                url: '/admin/quiz'
            });
            return Promise.reject();

        }else { // 存在该分类信息
            res.render('admin/quiz_edit',{
                userInfo: req.userInfo,
                quiz: quiz,
                url: 'quiz'
            });

        }
    });
});
/** 知识问答查看的保存*/
router.post('/quiz/edit',function (req,res) {

    // 获取要修改的分类的信息， 并且用表单的形式展现出来
    var id = req.query.id || ''; // 要修改的id
    var isReply = req.body.isReply || '';

    var findQuiz ;

    if (req.body.isReply){
        Comment.findOne({
            _id: isReply
        }).then(function (comment) {
            if (!comment) {  // 当没有要回复的一条评论时
                res.render('admin/tip', {
                    userInfo: req.userInfo,
                    status: 'warning',
                    message: '不存在该回答信息',
                    url: '/admin/quiz/edit?id='+id
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
            res.render('admin/tip', {
                userInfo: req.userInfo,
                status: 'warning',
                message: '保存信息失败',
                url: '/admin/quiz/edit?id='+id
            });
        }else{
            res.render('admin/tip', {
                userInfo: req.userInfo,
                status: 'success',
                message: '回答成功',
                url: '/admin/quiz/edit?id='+id
            });
        }
    });


});
/** 知识问答 评论的删除 */
router.get('/quiz/edit/commentDelete',function (req,res) {
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
        res.render('admin/tip',{
         userInfo: req.userInfo,
         status: 'success',
         message: '删除成功',
         url: '/admin/quiz?id='+quizId1
         });
    });

});

/** 个人设置 */
router.get('/personal',function (req,res,next) {
    User.findOne({
        _id: req.userInfo._id.toString()
    }).then(function (user) {
        // console.log(user);
        res.render('admin/personal',{
            userInfo: req.userInfo,
            user: user,
            url: 'personal'
        });
    })
});

/** 个人设置  重置密码 */
router.post('/personal',function (req,res,next) {
    var password = req.body.password;
    var passwordreset = req.body.passwordreset;
    var repasswordreset = req.body.repasswordreset;

    // 密码是否为空
    if (password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        // 返回结果
        res.json(responseData);
        return;
    }
    // 两次输入密码是否一致
    if (passwordreset !== repasswordreset){
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        // 返回结果
        res.json(responseData);
        return;
    }
    User.findOne({
        username: req.userInfo.username,
        password: password
    }).then(function (user) {
        if( !user){
            responseData.code = 4;
            responseData.message = '密码错误';
            // 返回结果
            res.json(responseData);
            return Promise.reject();
        }else{
            // 保存用户注册的信息到数据库
            user.password=passwordreset;
            return user.save(); // 保存
        }
    }).then(function (result) {
        // console.log(result);

        res.render('admin/tip',{
            userInfo: req.userInfo,
            status: 'success',
            message: '重置成功',
            url: '/admin/personal'
        });

    })

});


// 返回
module.exports = router ;