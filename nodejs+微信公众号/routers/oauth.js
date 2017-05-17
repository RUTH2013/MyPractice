/**
 * Created by shitou on 2017/4/28.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
// 引入user模型
var User = require('../models/User');
// 统一返回格式
var responseData;
responseData= {
    code: 0,
    message: ''
};



/* 微信登陆 */
var AppID = 'wxda012def4dfa6e8d';
var AppSecret = 'debd8ebbcd443c37fe828f7f84d24581';
router.get('/wx_login', function(req,res, next){
    console.log("oauth - login")

    // 第一步：用户同意授权，获取code
    var router = 'get_wx_access_token';
    // 这是编码后的地址
    var return_uri = 'http://wechat.sowdf.com/oauth/'+router;
    var scope = 'snsapi_userinfo';

    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');

});


router.get('/get_wx_access_token', function(req,res, next){
    console.log("get_wx_access_token")
    //console.log("code_return: "+req.query.code)

    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    request.get(
        {
            url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+AppID+'&secret='+AppSecret+'&code='+code+'&grant_type=authorization_code',
        },
        function(error, response, body){
            if(response.statusCode == 200){

                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                //console.log(JSON.parse(body));
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;

                request.get(
                    {
                        url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
                    },
                    function(error, response, body){
                        if(response.statusCode == 200){

                            // 第四步：根据获取的用户信息进行对应操作
                            var userinfo = JSON.parse(body);
                            //console.log(JSON.parse(body));
                            console.log('获取微信信息成功！');
                            // console.log(userinfo);
                            responseData.userInfo = {
                                username: userinfo.nickname,
                                headImgUrl: userinfo.headimgurl,
                                openId: userinfo.openid
                            };
                            // console.log(responseData);
                            res.redirect('/oauth/userInfo');


                        }else{
                            console.log(response.statusCode);
                        }
                    }
                );
            }else{
                console.log(response.statusCode);
            }
        }
    );
});

router.get('/userInfo',function(req,res,next){
    User.findOne({
        openId: responseData.userInfo.openId  // 查询条件
    }).then(function (userInfo) {
        console.log('用户信息'+userInfo); // 查询到的数据信息
        // 保存用户注册的信息到数据库
        if (!responseData.userInfo.openId) {
            return  Promise.reject();
        }
        if (userInfo) {
            userInfo.username = responseData.userInfo.username;
            userInfo.headImgUrl = responseData.userInfo.headImgUrl;
            return userInfo.save(); // 保存
        }
        else{
            var user = new User({// 通过操作对象来操作数据库
                openId: responseData.userInfo.openId,
                username: responseData.userInfo.username,
                headImgUrl: responseData.userInfo.headImgUrl
            });
            return user.save(); // 保存

        }

    }).then(function (newUserInfo) {
        console.log('新用户' + newUserInfo); // 新注册的信息数据
        responseData.message = '注册成功！';

        ////用来设置cookies 信息
        responseData.userInfo = {
            _id: newUserInfo._id,
            username: newUserInfo.username,
            headImgUrl: newUserInfo.headImgUrl
        };

        // console.log('cookies'+req.cookies);    
        req.session.userInfo2= JSON.stringify({
             _id: newUserInfo._id,
             username: encodeURIComponent(newUserInfo.username)
        });
        ////用来设置cookies 信息 --end
        console.log('用户跳转2');
        // res.json(responseData);
        res.redirect('/course');
    })
});


module.exports = router;