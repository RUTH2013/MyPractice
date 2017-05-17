/**
 *  上传图片
 */

$('.uploadImg').change(function(event) {
    /* Act on the event */
    if ($('.uploadImg').val().length) {
        var fileName = $('.uploadImg').val();
        var extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        if (extension == ".jpg" || extension == ".png") {
            var data = new FormData();
            data.append('upload', $('.uploadImg')[0].files[0]);
            console.log(extension);
            $.ajax({
                url: '/api/uploadImg',
                type: 'POST',
                data: data,
                cache: false,
                contentType: false, //不可缺参数
                processData: false, //不可缺参数
                success: function(data) {
                    console.log(data);
                    $('#img').val(data.msg);
                    $('.showImg').html('<img src="'+ data.msg +'" />');
                },
                error: function() {
                    console.log('error');
                    $('.showImg').html('<span>'+ data.msg +'</span>');
                }
            });
        }
    }
});