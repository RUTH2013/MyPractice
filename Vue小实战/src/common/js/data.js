/**
 * Created by Administrator on 2017/6/20.
 */

export function formatDate(date, format) {  // 时间格式化
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let obj = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in obj) {
        if (new RegExp(`(${k})`).test(format)) {
            let str = obj[k] + '';
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padZero(str));
        }
    }
    return format;
}
function padZero(str) {  // 补零
    return ('00' + str).substr(str.length);
}
