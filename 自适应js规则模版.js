
// {
//     "code": 0,
//     "message": "成功!",
//     "data": {
//         "name": "极品战兵在都市",
//         "status": "完结",
//         "introduce": "王洛羽回归都市，激战各方英豪。做我的女人，要么宠着，要么捧着。做我的敌人，不是死，就是在死的路上！",
//         "cover": "https://oss.mkzcdn.com/comic/cover/20200119/5e23f76727f6d-750x1000.jpg!cover-400",
//         "author": "二次元动漫",
//         "tag": "恋爱 生活",
//         "time": "2020.04.22"
//     },
//     "list": [
//         {
//         "num": "第1话",
//         "url": "mhz/212807/711548.html"
//         },
//         ...
//     ]
// }
{{
    var 列表规则 = "list";
    var 倒序标志 = "";
    var 章节 = JSON.parse(result).list;
    if (章节.length > 1) {
        var name1 = 章节[0].num;
        var name2 = 章节[1].num;
        if (name1.indexOf("第") > -1 || name1.indexOf("话") > -1 || /^[\s\d]+$/.test(name1)) {
            if (+name1.match(/\d+/) > +name2.match(/\d+/)) {
                倒序标志 = "-";
            }
        }
    }
    倒序标志 + 列表规则;
}}


`{{
    /// 第一部分js，规则预处理
    var preTreat = "";
    if(String(java.get("url")).indexOf("http") > -1)
    preTreat = "list..img@Header:{Referer:\""+java.get("url")+"\"}";
    else if(JSON.parse(result).list[0].img.indexOf("dmzj") > -1)
    preTreat = "list..img@Header:{Referer:\"https://manhua.dmzj.com/\"}";
    else
    preTreat  = "list..img";
    preTreat
    }}@js:
    /// 第二部分js，规则解析
    result.map(a=>{
    var i = a.lastIndexOf("=");
    if(i > -1)
    return a.substr(i + 1);
    else
    return a
})`;


{{
    (() => {
        String.prototype.包含 = function (s) { return this.indexOf(s) > -1 };
        var 基本规则 = "list..img";
        var 处理规则 = "@js:(" + (() => {
            return result.map(a => {
                var index = ("" + a).indexOf("=");
                if (index > -1) {
                    return ("" + a).substring(index + 1)
                }
                return a;
            })
        }) + ")();";
        var 请求头 = "";
        var 地址 = "" + java.get("url");
        if (地址.包含("http")) {
            请求头 = JSON.stringify({ Referer: 地址 });
        } else {
            var 结果 = result;
            var 第一张图片地址 = JSON.parse(结果).list[0].img;
            if (第一张图片地址.包含("dmzj")) {
                请求头 = JSON.stringify({ Referer: "https://manhua.dmzj.com" });
            }
        }
        return header ? 基本规则 + 处理规则 + "@Header:" + 请求头 : 基本规则 + 处理规则;
    })();
}}
