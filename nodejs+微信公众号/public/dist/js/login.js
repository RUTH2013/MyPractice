/**
 * 后台登录
 */

$(function(){
    var $loginInfo = $('.loginInfo');
    //登录
    $loginInfo.find('button').on('click', function() {
        console.log('click');
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginInfo.find('[name="username"]').val(),
                password: $loginInfo.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function(result) {

                $loginInfo.find('.info').html(result.message);

                if (!result.code) {
                    //登录成功
                    // window.location.reload();
                    window.location.assign("/admin/usersList");   // 切换路径
                    // window.location.assign("/course");   // 切换路径
                }
            }
        });
    });

    //退出
    $('#logout').on('click', function() {
        $.ajax({
            url: '/api/user/logout',
            success: function(result) {
                if (!result.code) {
                    window.location.reload();
                }
            }
        });
    })

});


