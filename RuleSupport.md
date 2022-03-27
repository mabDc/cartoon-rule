## 规则支持速览与说明
  - 阅读书源参考 [书源制作说明](https://gedoor.github.io/MyBookshelf/sourcerule.html)
  
### 作如下 7 个分类 
  - 1 源描述（名称、地址、分组、登录、ua）
  - 2 搜索（发现和搜索地址）
  - 3 url（搜索结果地址、目录地址、章节地址、2个封面地址、2个下一页地址、1个正文）
  - 4 字符串（2个书名、2个作者、2个最新章节、2个简介、1个章节名称）
  - 5 列表（搜索结果列表、目录列表、2个分类、2个下一页地址、1个正文）
  - ~~6 图片（2个封面地址+1个正文）~~（已消除图片与url区别，不再单独归类）
  - 7 通用（连接符、正则替换、js脚本、@put、@get、{{js表达式}}）
  
### 0. 坑点
  + JSONPath 
    - 形式 `@JSon:$.jsonPath` 或 `@JSon:jsonPath` 或 `$.jsonPath` 或 `jsonPath` 或 `{$.jsonPath}`
    - `jsonPath` 和 `{$.jsonPath}` 未显式指定JSONPath，依赖程序的默认判断，不可靠
    - 标准规范 [goessner JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)
    - 实现库 [json-path/JsonPath](https://github.com/json-path/JsonPath)
    - 在线测试 [Jayway JsonPath Evaluator](http://jsonpath.herokuapp.com/)
  + XPath
    - 形式 `@XPath:xpath` 或 `//xpath`
    - 标准规范 [W3C XPATH 1.0](https://www.w3.org/TR/1999/REC-xpath-19991116/) 
    - 实现库 [hegexiaohuozi/JsoupXpath](https://github.com/zhegexiaohuozi/JsoupXpath)
  + JSOUP
    - 形式 `@css:jsoup` 或 `class.chapter@tag.a!0` 或 `class.article.0@tag.p@text`
    - 标准规范与实现库 [Package org.jsoup.select, CSS-like element selector](https://jsoup.org/apidocs/org/jsoup/select/Selector.html)
    - 在线测试 [Try jsoup online: Java HTML parser and CSS debugger](https://try.jsoup.org/)
  + 正则
    - 形式 `#match#replacement`
    - 教程 [veedrin/horseshoe 2018-10 | Regex专题](https://github.com/veedrin/horseshoe#2018-10--regex%E4%B8%93%E9%A2%98)
      > [语法](https://github.com/veedrin/horseshoe/blob/master/regex/%E8%AF%AD%E6%B3%95.md)
      > [方法](https://github.com/veedrin/horseshoe/blob/master/regex/%E6%96%B9%E6%B3%95.md)
      > [引擎](https://github.com/veedrin/horseshoe/blob/master/regex/%E5%BC%95%E6%93%8E.md)
  + 自定义三种连接符：`&, &&, |, ||, %, %%`
  + 不支持动态内容，所有的规则解析以静态加载的内容为准(阅读支持动态内容，首字符用$表示动态加载)
  + 动态与静态的问题 [多多猫插件开发指南](https://www.kancloud.cn/magicdmer/ddcat_plugin_develop/1036896) 解释的很清楚
    > **2.5.2 插件的调试**<br>
    > ...<br>
    > **注意：** Ctrl+u和F12开发者工具Elements面板中显示源代码的的区别是前者显示的是不加载js的html源代码，后者显示的是加载内部外部js后的html代码。sited引擎读取前者代码，所以有时候在浏览器开发者工具（Console面板）能找出数据，在app里却报错，就是因为Ctrl+u源代码中没有相应数据。
  + 规则形式为 `rule@header:{key:value}@get:{key}@put:{key:rule}@js:`
  + 规则解析顺序为 @put -> @get -> @header -> rule -> @js
  + 前三个@不能嵌套，位置任意，@js必须放在最后
  + 解析流程如下
    - `输入searchKey -> 由搜索规则获得url -> 发送搜索请求并得到响应（静态） -> 进入搜索结果列表解析 -> 取搜索结果列表其中一个进入搜索页6项（名称、作者、分类、最新、简介、封面）解析 -> 根据书籍地址规则获得详情页url -> 发送详情页请求并得到响应（静态） -> 进入详情页6项（同上）解析 -> 获取目录页url -> 发送目录页请求并得到响应（静态） -> 进入目录列表解析 -> 取目录列表其中一个进入章节名称和章节url解析 -> 根据章节url发送请求并得到响应（静态或者阅读正文首字符用美元符号$可使这部分转为动态）-> 最后根据响应内容解析正文`
    - 请求合计4次（搜索地址、详情地址、目录地址、正文地址）
    - 响应为字符串，对请求发送获得响应后的首个规则有效，后面就根据规则变化了
    
    
###  JSONPath 与 XPath 参考
- 提供给书写时查阅，可当作使用手册，无需记住具体写法。
- 来源是 [goessner JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)

**数据文件**

```JSON
{ "store": {
    "book": [ 
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      { "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      { "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}
```

**操作符**

XPath | JSONPath | Description
:--: | :--: | :---
`/` | `$` | the root object/element
`.` | `@` | the current object/element
`/` | `. or []` | child operator
`..` | `n/a` | parent operator
`//` | `..` | recursive descent. JSONPath borrows this syntax from E4X.
`*` | `*` | wildcard. All objects/elements regardless their names.
`@` | `n/a` | attribute access. JSON structures don't have attributes.
`[]` | `[]` | subscript operator. XPath uses it to iterate over element collections and for predicates. In Javascript and JSON it is the native array operator.
&#124; | `[,]` | Union operator in XPath results in a combination of node sets. JSONPath allows alternate names or array indices as a set.
`n/a` | `[start:end:step]` | array slice operator borrowed from ES4.
`[]` | `?()` | applies a filter (script) expression.
`n/a` | `()` | script expression, using the underlying script engine.
`()` | `n/a` | grouping in Xpath

**示例对比**

XPath | JSONPath | Result
:--: | :--: | :---
`/store/book/author` | `$.store.book[*].author` | the authors of all books in the store
`//author` | `$..author` | all authors
`/store/*` | `$.store.*` | all things in store, which are some books and a red bicycle.
`/store//price` | `$.store..price` | the price of everything in the store.
`//book[3]` | `$..book[2]` | the third book
`//book[last()]` | `$..book[(@.length-1)]`<br>`$..book[-1:]` | the last book in order.
`//book[position()<3]` | `$..book[0,1]`<br>`$..book[:2]` | the first two books
`//book[isbn]` | `$..book[?(@.isbn)]` | filter all books with isbn number
`//book[price<10]` | `$..book[?(@.price<10)]` | filter all books cheapier than 10
`//*` | `$..*` | all Elements in XML document. All members of JSON structure.


### js加解密
```js
// 支持toast
ycy.toast("a")
ycy.toast(1)
ycy.toast([1])
ycy.toast({ a: 1 })

// 太长不看的直接看这几个例子就够 
// 需要byte二进制在方法名加ToBytes即可 如 ycy.MD5ToBytes()
var base64 = ycy.atob(toBytes("123"))
var base64 = ycy.atob(toBytes([0x31, 0x32, 0x33]))
var base64 = ycy.atob(toBytes([49, 50, 51]))
var base64 = ycy.atob(toBytes("313233", "hex"))
var base64 = ycy.atob(toBytes("MTIz", "base64"))
var md5 = ycy.MD5(toBytes("123"))
var hash = ycy.SHA(toBytes("123"))
var hash128 = ycy.encrypt("SHA-128", toBytes("123"))

var algorithm = "AES/CBC/PKCS5Padding" // 按照java编码格式
var data = "1234567890123456"
var key = "1234567890123456"
var iv = "1234567890123456"
var 密文1 = ycy.encrypt(algorithm, toBytes(data), toBytes(key)) // 部分算法不需要偏移量 省略 iv
var 密文2 = ycy.encrypt(algorithm, toBytes(data), toBytes(key), toBytes(iv)) // 默认需要编码到base64字符串
var 明文 = ycy.decrypt(algorithm, toBytes(data, "base64"), toBytes(key), toBytes(iv)) // 一般需要base64解码密文
// 例子完毕 下面是详细说明

// 以下部分是编码解码
// 为了避免混乱，编码解码的目标和结果全是bytes
// 所以编码前全部需要使用`toBytes`方法转为`byte[]`类型
// 这里开始介绍`toBytes`方法，它可以接受多种类型和编码方法，以下`toBytes`结果完全相同

// `toBytes`方法                            // -> 其他 -> java的`byte[]`类型
var bytes = toBytes(null, null, 4)          // -> [0,0,0,0] 这是为了方便自己处理, 长度在第三个参数
var bytes = toBytes("123")                  // -> [49,50,51]
var bytes = toBytes("\u0031\u0032\u0033")   // -> [49,50,51]
var bytes = toBytes([0x31, 0x32, 0x33])       // -> [49,50,51]
var bytes = toBytes([49, 50, 51])             // -> [49,50,51]
var bytes = toBytes("313233", "hex")         // -> [49,50,51]
var bytes = toBytes("MTIz", "base64")        // -> [49,50,51] 解码
// 特别的 有时候需要用 gbk编码
var some_other_bytes = toBytes("你不是猪", "gbk") // 每个字2字节相当于8字节相当于128bit长度

// `fromBytes`方法                       // `byte[]` -> 字符串
var data = fromBytes(bytes)              // -> "123"
var hex = fromBytes(bytes, "hex")        // -> "313233"
var base64 = fromBytes(bytes, "base64")  // -> "MTIz" base64编码
var str = fromBytes(some_other_bytes, "gbk")  // -> gbk解码

var data = "123";
// 通过 toBytes 得到的`byte[]`类型才可以用作以下编码方法的参数
// 从md5编码开始 需要指出 所有编码都支持用encrypt来写
var md5bytes = ycy.MD5ToBytes(toBytes(data))             // -> 需要手动显示转换 注意！
var md5bytes = ycy.MD5ToBytes(toBytes(hex, "hex"))       // -> hex字符串转bytes
var md5bytes = ycy.MD5ToBytes(toBytes(base64, "base64")) // -> base64字符串转bytes
var md5bytes = ycy.MD5ToBytes(bytes)            // -> 已经是`byte[]`类型不需要再次转换
var md5bytes = ycy.encryptToBytes("MD5", bytes) // 以上三种得到二进制 方便进一步处理
var md5 = ycy.MD5(bytes)                        // 得到hex格式字符串
var md516 = ycy.MD5(bytes).substring(8, 24)      // 得到16位md5字符串
var md5 = ycy.encrypt("MD5", bytes)             // 可以借助`encrypt`方法

// 得到 hash 值 32位 十六进制 HEX 字符串
var sha = ycy.SHA(bytes)
var sha = ycy.encrypt("SHA", bytes)
var sha = ycy.encrypt("SHA-1", bytes)
var sha = ycy.encrypt("SHA-128", bytes) // 得到 hash 值 128位 十六进制 HEX 字符串
var sha = ycy.encrypt("SHA-256", bytes) // 得到 hash 值 256位 十六进制 HEX 字符串
var shaBytes = ycy.SHAToBytes(bytes)    // 得到 hash 值 二进制byte数组
var shaBytes = ycy.encryptToBytes("SHA-1", bytes)


// base64 编码 得到bytes 和 字符串
var base64Bytes = ycy.btoaToBytes(bytes)
var base64 = ycy.btoa(bytes)
// base64 解码 得到bytes 和 字符串
var dataBytes = ycy.atobToBytes(base64Bytes)
var data = ycy.atob(toBytes(base64))

ycy.encrypt(algorithm, toBytes(data), toBytes(key), toBytes(iv))

// AES 加密
// 方法签名为 encrypt => fromBytes(encryptToBytes(algorithm, data, key, iv), "base64");
var algorithm = "AES/CBC/PKCS5Padding"
var key = "1234567890123456"
var keyHex = '31323334353637383930313233343536'
var keyArray = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53, 54]
// 处理方法为
var keyBytes = toBytes(key)
var keyBytes = toBytes(keyHex, "hex")
var keyBytes = toBytes(keyArray)
// iv处理同key
var ivBytes = toBytes("1234567890123456") // 加密算法不存在偏移量省略iv参数，若为空字符串将补全到128bit的0 相当于"\u0000\u0000\u0000\u0000"
var enBase64 = ycy.encrypt(algorithm, toBytes(data), keyBytes) // 这里是省略iv参数 取决于算法方法algorithm参数值
var enBase64 = ycy.encrypt(algorithm, toBytes(data), keyBytes, ivBytes) // 默认是base64编码结果字符串
var enBytes = ycy.encryptToBytes(algorithm, toBytes(data), keyBytes, ivBytes) // 得到bytes
var enHex = fromBytes(ycy.encryptToBytes(algorithm, toBytes(data), keyBytes, ivBytes), "hex") // 得到hex字符串
// AES 解密
// 方法签名为 decrypt => fromBytes(decryptToBytes(algorithm, data, key, iv));
var deBytes = ycy.decryptToBytes(algorithm, enBytes, keyBytes, ivBytes ) // 如果需要继续处理 显然结果用bytes合适
var 明文 = ycy.decrypt(algorithm, toBytes(enBase64, "base64"), keyBytes, ivBytes)       // 一般需要base64解码
var 明文 = fromBytes(ycy.decryptToBytes(algorithm, enBytes, keyBytes, ivBytes), "gbk") // 也许需要gbk解码
var 明文hex = fromBytes(ycy.encryptToBytes(algorithm, enBytes, keyBytes, ivBytes), "hex") // 得到hex字符串
```

### 1. 图源描述
  - 该类型内容均为简单静态字符串
  + 1.1 名称(bookSourceName)
    - 必填
    - 可以和其他图源相同
    - 发现列表将会显示、搜索结果最新章节如果为null则会显示。
  + 1.2 地址(bookSourceUrl)
    - 必填
    - 图源ID，与其他图源相同则覆盖
    - 图片规则(6.) header referer 中的 host 会被替换为该地址
    - 已知bug：地址需以 http:// 或 https:// 开头，否则导入导出将出现异常。
  + 1.3 分组(bookSourceGroup)
    - 被当作备注使用
    - 与规则解析无关
    - 若发现(2.1)规则为空或语法错误，刷新发现后将自动给出标注。
  + 1.4 登录(loginUrl)
    - 用于登录个人账户
    - 用于设置cookie
  + 1.5 ua(HttpUserAgent)
    - 设置请求头中的User-Agent
    
### 2. 搜索
  - 该类型关键字有 searchKey 和 searchPage 。
  - searchPage 同时还支持 searchPage-1 和 searchPage+1。
  + 2.1 发现(ruleFindUrl)
    - 形式为 `name::url`
    - 多个规则用 && 或 换行符 连接
    - 规则中若不含 `searchPage` 关键字，发现中持续下拉将循环。
    - 页数写法支持`{1, 2, 3, }`，发现中持续下拉将依次加载第一页、第二页、等。
    - 若为空或语法错误，刷新发现后，分组(1.3)将自动给出标注。
    - 支持 GET 或 POST ~~不支持post请求~~
    - 不支持相对url（阅读支持baseUrl为1.2 bookSourceUrl的相对url）
  + 2.2 搜索地址(ruleSearchUrl)
    - 必填
    - 如无搜索地址，则填入占位符`#`等
    - 形式1 https://host/?s=searchKey&p=searchPage@header:{a:b}
    - 将被解析为GET请求，User-Agent若为空则自动添加，如下。
        ```
        get https://host/?s=searchKey&p=searchPage HTTP/1.1
        User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.2357.134 Safari/537.36
        a:b
        ```
    - 形式2 https://host/?s=searchKey&p=searchPage@formType=type@header:{a:b}
    - 由于带@，被解析为POST请求，自动添加Content-Type: application/x-www-form-urlencoded，以form形式发送数据，如下。
        ```
        post https://host/?s=searchKey&p=searchPage HTTP/1.1
        Content-Type: application/x-www-form-urlencoded
        User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.2357.134 Safari/537.36
        a:b
        
        formType=type
        ```
    - 支持显示指定字符编码方式，形式为`|char=encode`
        ```
        https://host/?s=searchKey&p=searchPage@formType=type|char=utf8@header:{a:b}
        https://host/?s=searchKey&p=searchPage@formType=type|char=gbk@header:{a:b}
        https://host/?s=searchKey&p=searchPage@formType=type|char=escape@header:{a:b}
        ```
    - 若不需要特殊请求头则省略 @header 内容。
    - 请求头支持多个规则，如 `@header:{key1:value1,key2:value2}`。
    - 规则中可以不带 `searchKey` 和 `searchPage`。
    - 只支持单个规则，部分漫画搜名称和搜作者用的不同搜索地址，需要做成2个图源。
    - 不支持相对url
    
### 3. url
  - 当然，url 也属于字符串
  - 全部支持相对路径或绝对路径
  - header在此类规则下才有意义，写法同搜索字符串：`@header:{key1:value1,key2:value2}`
  - （放弃）~~与搜索url不同，这里的 header内容为rule，支持完整规则，需要用双引号包含起来。~~
  - 关键字：host、prePage、thisPage
    - host 固定为1.2内容
    - prePage 按顺序`图源地址 -> 搜索地址 -> 搜索结果地址 -> 目录地址 -> 正文地址`计算上一页地址
    - thisPage 为规则所在页面的地址，与baseUrl一致
    - 格式为`rule@header:{referer:thisPage}`
  - referer不存在默认定义，不写referer时，请求头就不带referer
  + 3.1 搜索结果地址(ruleSearchNoteUrl)
    - 必填
  + 3.2 目录地址(ruleChapterUrl)
    - 可空，此时使用搜索结果地址
  + 3.3 章节地址，或称正文地址(ruleContentUrl)
    - 必填
    - 若与目录同地址须填 `@js:""`
    - 拼接处理直接写不可靠，如有需要请使用 `@js:"urlstring"+result`
  + 3.4 封面地址，2个(ruleSearchCoverUrl, ruleCoverUrl)
    - 可空
    - 可能需要考虑 referer
  + 3.5 下一页地址，2个(ruleChapterUrlNext, ruleContentUrlNext)
  + 3.6 正文(ruleBookContent)
    - 可能需要考虑 referer
    - 不支持 @put
    - ~~不支持相对路径（唯一一处），可能需要补全 url~~
    - 异次元 1.4.8 (2019.03.28) 已支持相对url（$开始的规则放弃支持）
  
### 4. 字符串
  - JSOUP规则下，以text结尾和以html结尾表现不同，请自行尝试。
  - 书名或章节名称取到内容为空时会导致该书或章节被忽略。
  + 4.1 书名，2个(ruleSearchName, ruleBookName)
  + 4.2 作者，2个(ruleSearchAuthor, ruleBookAuthor)
    - 上述2个内容都存在空白压缩，作者位置还会过滤大部分符号，如（）、 {}、[]、【】等全部会被舍弃。
    - 作为一本书的联合ID，用于判定搜索结果是否属于同一本书。
  + 4.3 最新章节，2个(ruleSearchLastChapter, ruleBookhLastChapter)
  + 4.4 简介(ruleIntroduce)
  + 4.5 章节名称(ruleChapterName)
    - 章节名称常用正则替换规则为 `#^.*\s|^\D*(?=\d)`
    
### 5. 列表
  - 此处需注意js返回值类型。
  - 搜索结果列表和目录列表为对象数组，形如`[{name:"one",id:1,...},...]`，若使用js处理并返回String类型，需用到js标签`<js>...;JSON.stringfy(list);</js>@json:$`
  - 分类、章节下一页地址、正文为字符串数组，js返回内容同时支持字符串或字符串数组，即`"str1 \n str2"`或`["str1","str2",...]`
  + 5.1 搜索结果列表(ruleSearchList)
    - 搜索结果系列规则从此列表往后写   
  + 5.2 目录列表(ruleChapterList)
    - 章节名称、url规则从此列表往后写
    - 上述内容规则首字符使用负号(`-`)可使列表反序
  + 5.3 分类，2个(ruleSearchKind, ruleBookKind)
    - ~~ruleSearchKind为列表，ruleBookKind为字符串~~
  + 5.4 下一页地址，2个(ruleChapterUrlNext, ruleContentUrlNext)
    - 章节下一页地址（ruleChapterUrlNext）为列表，正文下一页地址（ruleContentUrlNext）为url
    - 依次向下一页地址发送请求，得到所有响应后开始下一步解析。
    - 需保证最后一页的规则取到内容为空，如有必要，请在规则中显式返回`null`或`""`。
  + 5.5 正文(ruleBookContent)

   
### 7. 通用
  + 7.1 三种连接符 `&, &&, |, ||, %, %%`
    - 简单规则的连接符，三种类型，格式分别为 `rule1&&rule2` 或 `rule1||rule2` 或 `rule1%%rule2`
    - & && 每个规则单独取元素再合并
    - | || 每个规则依次取元素，若没有内容则尝试下个规则，有内容则忽略后面规则
    - % %% 同 &，合并所有元素再重新排序，效果等同于归并，只在搜索结果列表和目录列表下有效
    - `& | %`不保证结果可靠，`&& || %%`更可靠（但也不完全）
  + 7.2 正则替换
    - 只能用于 jsoup 规则后
    - 形式为 `#match#replace`
    - `#replace` 可省略，此时将使用默认值`""`
    - 使用的方法为 replaceAll，即全局循环匹配
  + 7.3 js脚本
    - 形式为 `rule@js:js内容` 或 `rule1<js>js内容1</js>rule2<js>js内容2</js>rule3`
    - 包含 `result` 和 `baseUrl`，`baseUrl` 为规则所在页url（可靠）
    - 由于String存在问题，对应`replace()`和`split()`和`match()`等方法并不可靠，可能需要`new String()、String()、toString()、`等做类型转换。
    - 返回值类型支持String（适用于全部）、Array（适用于5.），Array内容支持字符串、数字、对象（不能嵌套），可混用
        ```js
        ["str", 1 ,{a:"b"},{"c":2}]
        ```
    - 执行结果必须带返回值，可参考如下形式，显式指定 return 内容
      ```js
      (function(result){
          // 处理result
          // ...
          // 当返回结果为字符串时
          return result;
          // 当返回结果为列表时
          return list;
      })(result);
      ```
    - 由于软件忽略了js报错信息，测试时可用如下方法让其显示
      ```js
      (function(result){
          try{
                // 处理result
                // ...
                // 当返回结果为字符串时
                return result;
                // 当返回结果为列表时
                return list;
          }
          catch(e){
                // 当返回结果为字符串时
                return ""+e;
                // 当返回结果为列表时
                return [""+e];  //列表对应名称处填@js:""+result进行查看
          }
      })(result);
      ```
    - 可用的自定义函数如下
      ```js
      java.aJax(String url)
      java.getString(String url)  //试验性，和aJax效果相同
      java.getBytes(String url)   //返回 byte[]，其他方法返回的结果都是java里的String对象
      
      java.postJson(String url, String json)  //例子 json=JSON.stringify({id:1,type:"comic"})
      java.postForm(String url, String form)  //例子 form="id=1&type=comic"
      java.base64Decoder(String base64)
      ```
    - 补充
      ```js
      // match取变量
      var variable = result.match(/variable='([^']*)'/)[1];
      var variable = result.match(/variable="([^"]*)"/)[1];
      var number = +result.match(/number=([0-9]+)/)[1];  //加号将类型转为数字（可靠）
      // @get取变量
      var variable = "@get:{key}";  // 用引号包含
      var number = @get:{key};      // 内容必须是合法的数字
      // 类型转换
      var jsonObject = JSON.parse(jsonString);
      var jsonString = JSON.stringify(jsonObject);
      var strObject = new String(strExp);   // strObject类型为js中的String对象
      var str = String(strExp);             // str类型为java.lang.String，使用该方法可避免
      var str = strExp.toString();          // `org.mozilla.javascript.ConsString cannot be cast to java.lang.String`错误
      // 验证变量存在(不可靠)
      typeof(variable) !== undefined
      // 验证内容不为空
      !!variable
      // 无脑eval（会让人上瘾）
      eval('('+str+')');
      ```
  + 7.4 @put
    - 形式为 `@put:{key1:rule1,key2:rule2}`
    - 正文和正文下一页不支持
  + 7.5 @get
    - 形式为 `@get:{key}`
    - @get 内容无类型，拼接和赋值需要用双引号包含


