/*
    pay.js
    微信支付的js文件

*/

var wxPayControl = {};
var request = require("request");
var url = require('url');
var queryString = require('querystring');
var crypto = require('crypto');
var xml2jsparseString = require('xml2js').parseString;
var wxConfig = {
    "wxAppId" : "wxda012def4dfa6e8d",//公众号appid
    "wxAppSecret" : "debd8ebbcd443c37fe828f7f84d24581",//公众号appsecrect
    "wxMchId" : "1454684002",//商户id
    "wxPayKey" : "x1oaPX4MvBXgIVAlbhONxFT3AdQ72nOz"//商户密钥
}



/**
 * 获取客户端的ip
 * req是发起请求的req
 */
getClienIp = function(req) {

    //固定ip
    return "120.24.169.84"

};

/*
 第一步 获取code
*/


/**
 * 获取微信的 AccessToken 和 openid
 */
wxPayControl.getAccessToken = function(obj,openid,callback) {

    // 拼接微信的支付的参数
    getBrandWCPayParams(obj,openid, function (error, responseData) {
        if (error) {
            callback(error);
        } else {
            //console.log("微信支付的参数");
            //console.log(responseData);
            callback(null, responseData);
        }
    });

}

/**
 * 获取微信统一下单的接口数据
 */
function getPrepayId(obj,openid){
    // 生成统一下单接口参数
    var UnifiedorderParams = {
        appid : wxConfig.wxAppId,
        body : obj.body,
        mch_id : wxConfig.wxMchId,
        nonce_str: createNonceStr(),
        notify_url : obj.notify_url,// 微信付款后的回调地址
        openid : openid,
        out_trade_no : obj.out_trade_no,//new Date().getTime(), //订单号
        spbill_create_ip : obj.spbill_create_ip,
        total_fee : 1,
        trade_type : 'JSAPI',
        attach:obj.attach,
    };
    // 返回 promise 对象
    return  new Promise(function (resolve, reject) {
        // 获取 sign 参数
        UnifiedorderParams.sign = getSign(UnifiedorderParams);


        var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        request.post({url : url, body:JSON.stringify(getUnifiedorderXmlParams(UnifiedorderParams))}, function (error, response, body) {
            //console.log("微信下单返回数据");
            // console.log(response);
            var prepay_id = '';
            if (!error && response.statusCode == 200) {
                // 微信返回的数据为 xml 格式， 需要装换为 json 数据， 便于使用
                xml2jsparseString(body, {async:true}, function (error, result) {
                    prepay_id = result.xml.prepay_id[0];
                    // 放回数组的第一个元素
                    resolve(prepay_id);
                });
            } else {
                reject(body);
            }
        });
    })
}

/**
 * 微信支付的所有参数
 * @param req 请求的资源, 获取必要的数据
 * @returns {{appId: string, timeStamp: Number, nonceStr: *, package: string, signType: string, paySign: *}}
 */
function getBrandWCPayParams(obj,openid,callback ){
    var prepay_id_promise = getPrepayId(obj,openid);
    prepay_id_promise.then(function (prepay_id) {
        var prepay_id = prepay_id;
        var wcPayParams = {
            "appId" : wxConfig.wxAppId,     //公众号名称，由商户传入
            "timeStamp" : parseInt(new Date().getTime() / 1000).toString(),         //时间戳，自1970年以来的秒数
            "nonceStr" : createNonceStr(), //随机串
            // 通过统一下单接口获取
            "package" : "prepay_id="+prepay_id,
            "signType" : "MD5",         //微信签名方式：
        };
        wcPayParams.paySign = getSign(wcPayParams); //微信支付签名
        // console.log(wcPayParams.paySign);
        //console.log("微信支付的所有参数");
        // console.log(wcPayParams);
        callback(wcPayParams);
    },function (error) {
        callback(error);
    });
}

/**
 * 获取微信统一下单参数
 */
function getUnifiedorderXmlParams(obj){
    var body = '<xml>' +
        '<appid>'+wxConfig.wxAppId+'</appid>' +
        '<body>'+obj.body+'</body>' +
        '<mch_id>'+wxConfig.wxMchId+'</mch_id>' +
        '<nonce_str>'+obj.nonce_str+'</nonce_str>' +
        '<notify_url>'+obj.notify_url+'</notify_url>' +
        '<openid>'+obj.openid+'</openid>' +
        '<attach>'+obj.attach+'</attach>' +
        '<out_trade_no>'+obj.out_trade_no+'</out_trade_no>'+
        '<spbill_create_ip>'+obj.spbill_create_ip+'</spbill_create_ip>' +
        '<total_fee>'+obj.total_fee+'</total_fee>' +
        '<trade_type>'+obj.trade_type+'</trade_type>' +
        '<sign>'+obj.sign+'</sign>' +
        '</xml>';
    return body;
}

/**
 * 获取微信支付的签名
 * @param payParams
 */
function getSign(signParams){
    // 按 key 值的ascll 排序
    //console.log('支付签名');
    // console.log(signParams);
    var keys = Object.keys(signParams);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (val, key) {
        if (signParams[val]){
            newArgs[val] = signParams[val];
        }
    })
    var string = queryString.stringify(newArgs)+'&key='+wxConfig.wxPayKey;
    //console.log(string);

    // 生成签名
    return crypto.createHash('md5').update(queryString.unescape(string), 'utf8').digest("hex").toUpperCase();
}

/**
 * 获取随机的NonceStr
 */
function createNonceStr(){
    return Math.random().toString(36).substr(2, 15);
}


module.exports = wxPayControl;