/**
 *  API模块
 */

var express = require('express');
// 创建路由对象
var router = express.Router();// 监听 以 /api 开始的url

var formidable = require('formidable');
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

// 引入user模型
var User = require('../models/User');
// 引入Course模型  课程
var Course = require('../models/Course');


// 统一返回格式
var responseData;
router.use(function (req,res,next) {
    responseData= {
        code: 0,
        message: ''
    };
    next();
});

router.get('/login',function (req,res,next) {
    res.render('admin/login');
});

/*微信支付回调*/
router.post('/course/notify',function (req,res,next) {
    // body...
    // console.log(req.body.xml);

    var xml = req.body.xml;
    if(xml.return_code == 'SUCCESS' && xml.result_code == 'SUCCESS' ){
        // console.log("xml数据："+xml);
        // console.log('xml数据2'+xml.attach.split(","));
        var courseId = xml.attach.split(",")[0];
        var userId = xml.attach.split(",")[1];
        console.log("courseId:"+courseId);
        console.log("userId:"+userId);

        var isShow = false; // 判断是否保存了
        Course.findOne({
            _id: courseId
        }).populate('peopleNum').then(function (course) {
            console.log(course);
            for (var j=0; j<course.peopleNum.length; j++){
                console.log(course.peopleNum.length);
                if (course.peopleNum[j]._id == userId) {
                    isShow = true;
                }
            }
            console.log('查询课程');
            console.log('isShow:'+isShow);

            if(isShow){
                return Promise.reject();
            }else{
                console.log('保存0');
                User.update({
                    _id: userId
                },{
                    '$addToSet':{'course':courseId}
                }).then(function (result) {
                    console.log(result);
                    if(!result.nModified){
                        return;
                    }
                    Course.update({
                        _id: courseId
                    },{
                        '$addToSet':{'peopleNum': userId}
                    }).then(function (result) {
                        console.log('保存课程订购情况');
                    })
                });
            }
        })






        // User.update({
        //     _id: req.userInfo._id.toString()
        // },{
        //     '$addToSet':{'course':id}
        // }).then(function (result) {
        //     if(!result.nModified){
        //         res.render('main/tip',{
        //             userInfo: req.userInfo,
        //             status: 'warning',
        //             message: '已经报名过，不能再次报名',
        //             url: '/course/detail?id='+id
        //         });
        //         return;
        //     }
        //     Course.update({
        //         _id: id
        //     },{
        //         '$addToSet':{'peopleNum': req.userInfo._id.toString()}
        //     }).then(function (result) {
        //         res.render('main/tip',{
        //             userInfo: req.userInfo,
        //             status: 'success',
        //             message: '报名成功',
        //              url: '/personal/course?userid='+ req.userInfo._id
        //         });
        //     })
        // });
    }  

})



/** 用户注册  */
router.post('/user/register',function (req,res) {   //   /user/xxx === /api/user/xxx

    // console.log(req.body); // req.body == > post发生过来的数据
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    // 用户名是否为空
    if (username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        // 返回结果
        res.json(responseData);
        return;
    }
    // 密码是否为空
    if (password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        // 返回结果
        res.json(responseData);
        return;
    }
    // 两次输入密码是否一致
    if (password !== repassword){
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        // 返回结果
        res.json(responseData);
        return;
    }
    // 用户名是否已经被注册
    User.findOne({
        username: username  // 查询条件
    }).then(function (userInfo) {
       // console.log(userInfo); // 查询到的数据信息
        if( userInfo ){  //查询到结果
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            // 返回结果
            res.json(responseData);
            return;
        }
        // 保存用户注册的信息到数据库
        var user = new User({// 通过操作对象来操作数据库
            username: username,
            password: password
        });
        return user.save(); // 保存

    }).then(function (newUserInfo) {
        // console.log(newUserInfo); // 新注册的信息数据
        responseData.message = '注册成功！';

        ////用来设置cookies 信息
        responseData.userInfo = {
            _id: newUserInfo._id,
            username: newUserInfo.username
        };

        // 发送cookie信息 -- > 用户登录信息
        req.session.userInfo2= JSON.stringify({
             _id: userInfo._id,
             username: userInfo.username
        });
        /*req.cookies.set('userInfo',JSON.stringify({
            _id: newUserInfo._id,
            username: newUserInfo.username
        }));*/
        ////用来设置cookies 信息 --end

        res.json(responseData);
    });

});

/** 用户登录 */
router.post('/user/login',function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username,password);

    // 判断用户名 和 密码是否为空
    if (username == '' || password ==''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        // 返回结果
        res.json(responseData);
        return;
    }

    // 查询数据库中相同用户名和密码是否存在
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        console.log(userInfo)
        if (!userInfo){  // 不存在
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            // 返回结果
            res.json(responseData);
            return;
        }

        // 登陆正确
        responseData.message = '登录成功';

        /////////用来设置cookies 信息
        responseData.userInfo = {
            _id: userInfo._id,
            username: encodeURIComponent(userInfo.username)
        };

        // 发送cookie信息 -- > 用户登录信息
        // req.cookies.set('userInfo',JSON.stringify({
        //     _id: userInfo._id,
        //     username: encodeURIComponent(userInfo.username)
        // }));
        req.session.userInfo2= JSON.stringify({
             _id: userInfo._id,
             username: encodeURIComponent(userInfo.username)
        });

        ////////用来设置cookies 信息 --end
        console.log(responseData);

        // 返回结果
        res.json(responseData);

    });
});

/** 用户登录退出 */
router.get('/user/logout',function (req,res) {
    // 将cookie设置为空 --- > 清除cookies信息
    // req.cookies.set('userInfo', null);
    req.session.userInfo2= null;
    responseData.message = '退出成功';
    // 返回结果
    res.json(responseData);
});


/** 管理员添加 */
router.post('/isAdmin/add',function (req,res) {
    // 内容的id
    var userId = req.body.userid || '';

    // 查询当前这篇内容的信息
    User.findOne({
        _id: userId
    }).then(function (user) {

        user.isAdmin= true;
        return user.save()
    }).then(function (newUser) {
        responseData.message = '添加成功';
        // 返回结果
        res.json(responseData);
    });

});
/** 管理员取消 */
router.post('/isAdmin/cancel',function (req,res) {
    // 内容的id
    var userId = req.body.userid || '';

    // 查询当前这篇内容的信息
    User.findOne({
        _id: userId
    }).then(function (user) {

        user.isAdmin= false;
        return user.save()
    }).then(function (newUser) {
        responseData.message = '取消成功';
        // 返回结果
        res.json(responseData);
    });

});

/**KindEditor  */
/*router.post('/uploadImg', function(req, res, next) {
    var form = new formidable.IncomingForm();
    var addpath = '/public/upload';
    form.keepExtensions = true;
    form.uploadDir = __dirname.lastIndexOf('/') == -1 ? (__dirname.substr(0,__dirname.lastIndexOf('\\')) + addpath) :(__dirname.substr(0,__dirname.lastIndexOf('/')) + addpath) ;
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files.imgFile;
        var path = image.path;
        path = path.replace('/\\/g', '/');
        var url = path.lastIndexOf('/') == -1 ?(addpath+'/' + path.substr(path.lastIndexOf('\\')+1 , path.length)) : (addpath+'/'  + path.substr(path.lastIndexOf('/')+1 , path.length)) ;
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
});*/


/**wangEditor  */
router.post('/upload', function(req, res, next) {
    // 使用第三方的 formidable 插件初始化一个 form 对象
    var form = new formidable.IncomingForm();
    // 文件将要上传到哪个文件夹下面
    var uploadfolder = '/public/upload';
    var uploadfolderpath =path.join( __dirname.lastIndexOf('/') == -1 ? __dirname.substr(0,__dirname.lastIndexOf('\\')) : __dirname.substr(0,__dirname.lastIndexOf('/')) , uploadfolder ) ;
    // form.keepExtensions = true;
    form.uploadDir = uploadfolderpath ;   //  设置 文件保存的临时目录为当前文件想要上传的目录一致

    // 处理 request
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }

        var item;

        // 计算 files 长度
        var length = 0;
        for (item in files) {
            length++;
        }
        if (length === 0) {
            console.log('files no data');
            return;
        }

        for (item in files) {
            var file = files[item];
            // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
            var tempfilepath = file.path;
            // 获取文件类型
            var type = file.type;

            // 获取文件名，并根据文件名获取扩展名
            var filename = file.name;
            var extname = filename.lastIndexOf('.') >= 0
                ? filename.slice(filename.lastIndexOf('.') - filename.length)
                : '';
            // 文件名没有扩展名时候，则从文件类型中取扩展名
            if (extname === '' && type.indexOf('/') >= 0) {
                extname = '.' + type.split('/')[1];
            }
            // 将文件名重新赋值为一个随机数（避免文件重名）
            filename = Math.random().toString().slice(2) + extname;

            // 构建将要存储的文件的路径
            var filenewpath = path.join(uploadfolderpath, filename);

            // 将临时文件保存为正式的文件
            fs.rename(tempfilepath, filenewpath, function (err) {
                // 存储结果
                var result = '';

                if (err) {
                    // 发生错误
                    console.log('fs.rename err');
                    result = 'error|save error';
                } else {
                    // 保存成功
                    console.log('fs.rename done');
                    // 拼接图片url地址
                    result = uploadfolder + '/' + filename;
                }

                // 返回结果
                res.writeHead(200, {
                    'Content-type': 'text/html'
                });
                res.end(result);
            }); // fs.rename
        } // for in
    });
});

/** 上传图片*/
router.post('/uploadImg',function (req,res,next) {
    var uploadfolder = '/public/upload';
    var uploadfolderpath =path.join( __dirname.lastIndexOf('/') == -1 ? __dirname.substr(0,__dirname.lastIndexOf('\\')) : __dirname.substr(0,__dirname.lastIndexOf('/')) , uploadfolder ) ;


    if (!fs.existsSync(uploadfolderpath)) {
        fs.mkdirSync(uploadfolderpath);
    }
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = uploadfolderpath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    var displayUrl;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
        var extName = ''; //后缀名
        switch (files.upload.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        if (extName.length === 0) {
            res.send({
                code: 202,
                msg: '只支持png和jpg格式图片'
            });
            return;
        } else {
            var avatarName = '/' + Date.now() + '.' + extName;
            var newPath = form.uploadDir + avatarName;
            displayUrl = uploadfolder + avatarName;
            fs.renameSync(files.upload.path, newPath); //重命名
            res.send({
                code: 200,
                msg: displayUrl
            });
        }
    })
});

// 返回
module.exports = router ;