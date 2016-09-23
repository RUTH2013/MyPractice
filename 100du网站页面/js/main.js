/**
 * Created by Administrator on 2016/6/19.
 */


$(function () {

    // 头部切换城市
    (function () {
        var $a = $('.city').find('a');
        $a.each(function () {
            $(this).click(function () {
               $a.removeClass('active').eq( $(this).index()).addClass('active');
            });
        });
    })();

    // 切换搜索框和搜索文字焦点
    (function () {
        var $aLI = $('#menu').find('li');
        var $oText = $('#search').find('.form .text');
        var arrText = [
            '例如：荷棠鱼坊烧鱼 或 樱花日本料理',
            '例如：昌平区育新站龙旗广场2号楼609室',
            '例如：万达影院双人情侣券',
            '例如：东莞出事了，大老虎是谁？',
            '例如：北京初春降雪，天气变幻莫测'
        ];
        var iNow = 0;
        $oText.val(arrText[iNow]);

        $aLI.each(function (index) {
            $(this).click(function () {
                //console.log(index);
                $aLI.attr('class','gradient');
                $(this).attr('class','active');
                iNow = index;
                $oText.val(arrText[iNow]);
            });
        });

        $oText.focus(function () {
            if( $(this).val()  == arrText[iNow]){
                $(this).val('');
            }
        });
        $oText.blur(function () {
            if( $(this).val() == ''){
                $(this).val(arrText[iNow]) ;
            }
        });

    })();

    //搜索框下的update文字弹性滑动
    (function () {
        var $update = $('.update');
        var $oUl = $update.find('ul');
        var $liH= 0;
        var $BtnUp = $('#updateUpBtn');
        var $BtnDown = $('#updateDownBtn');
        var iNow = 0;
        var timer = null;

        var arrData = [
            { 'name':'萱萱', 'time':4, 'title':'那些灿烂华美的瞬间', 'url':'#' },
            { 'name':'畅畅', 'time':5, 'title':'广东3天抓获涉黄疑犯', 'url':'#' },
            { 'name':'萱萱', 'time':6, 'title':'国台办回应王郁琦', 'url':'#' },
            { 'name':'畅畅', 'time':7, 'title':'那些灿烂华美的瞬间', 'url':'#' },
            { 'name':'萱萱', 'time':8, 'title':'那些灿烂华美的瞬间', 'url':'#' },
            { 'name':'畅畅', 'time':9, 'title':'广东3天抓获涉黄疑犯', 'url':'#' },
            { 'name':'萱萱', 'time':10, 'title':'国台办回应王郁琦', 'url':'#' },
            { 'name':'畅畅', 'time':11, 'title':'那些灿烂华美的瞬间', 'url':'#' }
        ];
        var str ='';
        for(var i=0; i<arrData.length; i++){
            str +='<li><a href=" '+ arrData[i].url + ' "> <strong>' + arrData[i].name + '  </strong><span> '
                + arrData[i].time + '分钟前 </span>写了一篇新文章：'+arrData[i].title+'...</a></li>';
        }
        //console.log(str);
        $oUl.html(str);
        $liH= $oUl.find('li').height();

        //$oUl.animate({'top':$liH*-1},3000,'elasticOut');

        $BtnUp.click(function () {
            doMove(-1);
        });
        $BtnDown.click(function () {
            doMove(1);
        });
        $update.hover(function () {
            clearInterval(timer);
        },  autoPlay);

        autoPlay();
        function autoPlay(){
            timer = setInterval(function () {
                doMove(-1);
            },2000);
        }

        function doMove( num ){
            iNow += num;
            if( Math.abs(iNow) > arrData.length-1){
                iNow = 0;
            }
            if( iNow > 0){
                iNow = -(arrData.length-1);
            }
            $oUl.stop().animate({'top':$liH*iNow},2000,'elasticOut');
        }

    })();

    //options 选项卡切换
    (function () {

        fnTab( $('.tabNav1'),$('.tabCon1'),'click');
        fnTab( $('.tabNav2'),$('.tabCon2'),'click');
        fnTab( $('.tabNav3'),$('.tabCon3'),'mouseover');
        fnTab( $('.tabNav4'),$('.tabCon4'),'mouseover');

        function fnTab( oNav, aCon ,event){
            var $Elem = oNav.children();
            aCon.hide().eq(0).show();

            $Elem.each(function (index) {
                $(this).on( event ,function () {
                    $Elem.removeClass('active').addClass('gradient');
                    $(this).removeClass('gradient').addClass('active');
                    $Elem.find('a').attr('class','triangle_down_gray');
                    $(this).find('a').attr('class','triangle_down_red');

                    aCon.hide().eq(index).show();
                });
            });
        }

    })();

    //自动播放的焦点图
    (function () {

        var $fade = $('#fade');
        var $UlLi = $fade.find('ul li');
        var $OlLi = $fade.find('ol li');
        var $p = $fade.find('p');
        var arr = [ '爸爸去哪儿啦~', '人像摄影中的光影感', '娇柔妩媚、美艳大方' ];
        var iNow = 1;
        var timer = null ;

        fnFade();
        autoPlay();

        $OlLi.click(function () {
            iNow = $(this).index();
            fnFade();
        });
        $fade.hover(function () {
            clearInterval(timer);
        },autoPlay);

        function autoPlay(){
            timer = setInterval(function () {
                iNow ++;
                iNow %= arr.length;
                fnFade();
            },1000);
        }

        function fnFade(){
            $UlLi.each(function (index) {
                if( index != iNow ){
                    $UlLi.eq(index).fadeOut().css('zIndex',1);
                    $OlLi.eq(index).removeClass('active');
                }else {
                    $UlLi.eq(index).fadeIn().css('zIndex',2);
                    $OlLi.eq(index).addClass('active');
                }
                $p.text(arr[iNow]);
            });
        }

    })();

    //日历提示说明
    (function () {
        var $span = $('.calendar h3 span');
        var $aImg = $('.calendar').find('.img');
        var $prompt = $('.today_info');
        var $oImg = $prompt.find('img');
        var $strong = $prompt.find('strong');
        var $p = $prompt.find('p');

        $aImg.hover(function () {
            var iLeft = $(this).parent().position().left + 60;
            var iTop = $(this).parent().position().top -30;
            var index =  $(this).parent().index() % $span.size();
            $prompt.show().css({'left':iLeft, 'top':iTop});
            $p.text( $(this).attr('info') );
            $oImg.attr('src',$(this).attr('src'));
            $strong.text( $span.eq(index).text() );

        }, function () {
            $prompt.hide();
        })

    })();

    // BBS高亮显示
    (function () {
        var $li = $('.bbs').find('ol li');
        $li.mouseover(function () {
            $li.removeClass('active').eq( $(this).index()).addClass('active');
        });
    })();

    // HOT鼠标提示效果
    (function () {
        var $li = $('.hot_area').find('li');
        var arr = [
            '',
            '用户1<br />人气1',
            '用户名：性感宝贝<br />区域：朝阳CBD<br />人气：124987',
            '用户3<br />人气3',
            '用户4<br />人气4',
            '用户5<br />人气5',
            '用户6<br />人气6',
            '用户7<br />人气7',
            '用户8<br />人气8',
            '用户9<br />人气9',
            '用户10<br />人气10'
        ];
        $li.mouseover(function () {
            if( $(this).index() ==0 ){
                return ;
            }
            $li.find('p').remove();
            $(this).append('<p style="width:'+ ($(this).width()-12)+'px; height: '+ ($(this).height()-12 )+ 'px; "> '+arr[$(this).index()]+' </p>');

        })

    })();
});