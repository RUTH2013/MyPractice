/**
 * Created by Administrator on 2017/6/21.
 */
/**
 * 解析url参数
 * @example ?id=123456&a=b
 * @return  Object { id: 123456, a: b }
 * */
export function urlParse() {  // 从url 中获得 key，value
    let url = window.location.search;  // 获得url
    let obj = {};
    let reg = /[?&][^?&]+=[^?&]+/g;
    let arr = url.match(reg); // ['?id=123456,'&a=b']
    if (arr) {
        arr.forEach((item) => {
            let tempArr = item.substring(1).split('=');
            let key = decodeURIComponent(tempArr[0]);
            let val = decodeURIComponent(tempArr[1]);
            obj[key] = val;
        });
    }
    return obj;
}
