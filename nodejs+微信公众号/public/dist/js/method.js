/**
 * Created by Administrator on 2017/3/25.
 */

/**   判断是否上架  */
function isPutAway(url) {
// 上架
    $('.addPutAway').on('click',function () {
        console.log($(this).next().val());
        $.ajax({
            type: 'POST',
            url:  url +'/add',
            data: {
                id: $(this).next().val()
            },
            success: function (result) {
                console.log(result);
                window.location.reload();
            }
        });

    });

// 下架
    $('.cancelPutAway').on('click',function () {
        $.ajax({
            type: 'POST',
            url: url +'/cancel' ,
            data: {
                id: $(this).next().val()
            },
            success: function (result) {
                window.location.reload();

            }
        });

    });

}

/** 设置管理员权限  */
function isAdmin(url) {
    // 添加为管理员
    $('.addAdmin').on('click',function () {
        // console.log($(this).next().val());
        $.ajax({
            type: 'POST',
            url: url + '/add',
            data: {
                userid: $(this).next().val()
            },
            success: function (result) {
                window.location.reload();
            }
        });

    });

// 取消为管理员
    $('.cancelAdmin').on('click',function () {
        $.ajax({
            type: 'POST',
            url: url + '/cancel',
            data: {
                userid: $(this).next().val()
            },
            success: function (result) {
                window.location.reload();

            }
        });

    });
}

/**  html 的格式化 */

function htmlDecodeByRegExp(str){
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&amp;/g,"&");
    s = s.replace(/&lt;/g,"<");
    s = s.replace(/&gt;/g,">");
    s = s.replace(/&nbsp;/g," ");
    s = s.replace(/&#39;/g,"\'");
    s = s.replace(/&quot;/g,"\"");
    return s;
}

/** 显示图片*/
function showImg(str) {
    var strHtml = htmlDecodeByRegExp(str);

    var reg1=/src=\"([^\"]*?)\"/gi;

    if(!strHtml.match(reg1)){
        return '';
    }
    strHtml= strHtml.match(reg1)[0];
    strHtml= strHtml.replace(/^src=\"|\"$/g,'');

    return strHtml;

}

/** 时间处理 */
function timeAgo(val){
    var nowDate = new Date();
    var replyDate = new Date(val);
    var diffSeconds = (nowDate.getTime()-Number(replyDate.getTime()))/1000;
    var years = 365*24*60*60;
    var months = 30*24*60*60;
    var days = 24*60*60;
    var hours =  60*60;
    var minutes = 60;
    var seconds = 1;
    if(diffSeconds<seconds){
        return '1秒以前'
    }else if(seconds<=diffSeconds&&diffSeconds<minutes){
        return Math.floor(diffSeconds/seconds)+'秒前'
    }else if(minutes<=diffSeconds&&diffSeconds<hours){
        return Math.floor(diffSeconds/minutes)+'分钟前'
    }else if(hours<diffSeconds&&diffSeconds<days){
        return Math.floor(diffSeconds/hours)+'小时前'
    }else if(days<diffSeconds&&diffSeconds<months){
        return Math.floor(diffSeconds/days)+'天前'
    }else if(months<diffSeconds&&diffSeconds<years){
        return Math.floor(diffSeconds/months)+'个月前'
    }else{
        return val
    }
}

/**图片大小*/
function limitImg(img,parent) {
    var areaWidth = parent.width();
    var areaHight = parent.height();
    var image = new Image();
    image.src = img.attr('src');
    image.onload = function(){
        if (image.width>0 && image.height>0){
            if (image.width/image.height<= areaWidth/areaHight){
                console.log(1);
                img.css({
                    width: '100%',
                    height: 'auto',
                    maxWidth: 'none'
                });
            }else{
                console.log(2);
                img.css({
                    width: 'auto',
                    height: '100%',
                    maxWidth: 'none'
                });

            }
        }
    };

}

/* 计算 视频的宽度 */
function videoSize(parent,children) {
    var scale = children.width()/children.height();
    if( children.outerWidth(true) > parent.width() ){
        children.css({
            maxWidth: '100%'
        });
        children.width(parent.width()) ;
        children.height(children.width()/scale);

    }
}