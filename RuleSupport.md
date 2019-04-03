## 规则支持详解
### 从具体实现或图源写法上，分为7类
  - 1 图源描述（名称、地址、分组、登录、ua）
  - 2 搜索（发现和搜索地址）
  - 3 url（搜索结果地址、目录地址、章节地址、2个封面地址）
  - 4 字符串（2个书名、2个作者、2个最新章节、1个简介、1个章节名称）
  - 5 列表（搜索结果列表、目录列表、2个分类、2个下一页地址、1个正文）
  - 6 图片（2个封面地址+1个正文）
  - 7 通用（连接符、正则替换、js脚本、@put、@get）
  
### 0. 坑点
  + JSONPath 
    - 形式 `@JSon:$.jsonPath` 或 `@JSon:jsonPath` 或 `$.jsonPath` 或 `jsonPath` 或 `{$.jsonPath}`
    - `jsonPath` 和 `{$.jsonPath}` 未显式指定JSONPath，依赖程序的默认判断，不可靠
    - 标准规范 [goessner JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)
    - 实现库 [(github) json-path/JsonPath](https://github.com/json-path/JsonPath)
    - 在线测试 [Jayway JsonPath Evaluator](http://jsonpath.herokuapp.com/)
  + XPath
    - 形式 `@XPath:xpath` 或 `//xpath`
    - 标准规范 [W3C XPATH 1.0](https://www.w3.org/TR/1999/REC-xpath-19991116/) 
    - 实现库 [(github) zhegexiaohuozi/JsoupXpath](https://github.com/zhegexiaohuozi/JsoupXpath)
  + JSOUP
    - 形式 `@css:jsoup` 或 `class.chapter@tag.a!0` 或 `class.article.0@tag.p@text`
    - 标准规范与实现库 [Package org.jsoup.select, CSS-like element selector](https://jsoup.org/apidocs/org/jsoup/select/Selector.html)
  + 正则教程 
    - [veedrin/horseshoe 2018-10 | Regex专题](https://github.com/veedrin/horseshoe#2018-10--regex%E4%B8%93%E9%A2%98)
      > [语法](https://github.com/veedrin/horseshoe/blob/master/regex/%E8%AF%AD%E6%B3%95.md)
      > [方法](https://github.com/veedrin/horseshoe/blob/master/regex/%E6%96%B9%E6%B3%95.md)
      > [引擎](https://github.com/veedrin/horseshoe/blob/master/regex/%E5%BC%95%E6%93%8E.md)
  + 自定义五个连接符：`&, &&, |, ||, %`
  + 不支持动态内容，所有的规则解析以静态加载的内容为准(阅读支持动态内容，首字符用$表示动态加载)
  + 规则形式为 `rule@header:{key:rule}@get:{key}@put:{key:rule}@js:`
  + 规则解析顺序为 @put -> @get -> @header -> rule -> @js
  + 前三个@不能嵌套，位置任意，@js必须放在最后
  
### JSONPath 书写说明
引用自 [(github) json-path/JsonPath](https://github.com/json-path/JsonPath)，更多示例请参考原文
>Operators
>---------
>
>| Operator                  | Description                                                        |
>| :------------------------ | :----------------------------------------------------------------- |
>| `$`                       | The root element to query. This starts all path expressions.       |
>| `@`                       | The current node being processed by a filter predicate.            |
>| `*`                       | Wildcard. Available anywhere a name or numeric are required.       |
>| `..`                      | Deep scan. Available anywhere a name is required.                  |
>| `.<name>`                 | Dot-notated child                                                  |
>| `['<name>' (, '<name>')]` | Bracket-notated child or children                                  |
>| `[<number> (, <number>)]` | Array index or indexes                                             |
>| `[start:end]`             | Array slice operator                                               |
>| `[?(<expression>)]`       | Filter expression. Expression must evaluate to a boolean value.    |
>
>
>Functions
>---------
>
>Functions can be invoked at the tail end of a path - the input to a function is the output of the path expression.
>The function output is dictated by the function itself.
>
>| Function                  | Description                                                        | Output    |
>| :------------------------ | :----------------------------------------------------------------- |-----------|
>| min()                    | Provides the min value of an array of numbers                       | Double    |
>| max()                    | Provides the max value of an array of numbers                       | Double    |
>| avg()                    | Provides the average value of an array of numbers                   | Double    |
>| stddev()                 | Provides the standard deviation value of an array of numbers        | Double    |
>| length()                 | Provides the length of an array                                     | Integer   |
>
>
>Filter Operators
>-----------------
>
>Filters are logical expressions used to filter arrays. A typical filter would be `[?(@.age > 18)]` where `@` represents the current item being processed. More complex filters can be created with logical operators `&&` and `||`. String literals must be enclosed by single or double quotes (`[?(@.color == 'blue')]` or `[?(@.color == "blue")]`).   
>
>| Operator                 | Description                                                       |
>| :----------------------- | :---------------------------------------------------------------- |
>| ==                       | left is equal to right (note that 1 is not equal to '1')          |
>| !=                       | left is not equal to right                                        |
>| <                        | left is less than right                                           |
>| <=                       | left is less or equal to right                                    |
>| >                        | left is greater than right                                        |
>| >=                       | left is greater than or equal to right                            |
>| =~                       | left matches regular expression  [?(@.name =~ /foo.*?/i)]         |
>| in                       | left exists in right [?(@.size in ['S', 'M'])]                    |
>| nin                      | left does not exists in right                                     |
>| subsetof                 | left is a subset of right [?(@.sizes subsetof ['S', 'M', 'L'])]     |
>| size                     | size of left (array or string) should match right                 |
>| empty                    | left (array or string) should be empty                            |
>
>
>Path Examples
>-------------
>
>Given the json
>
>```javascript
>{
>    "store": {
>        "book": [
>            {
>                "category": "reference",
>                "author": "Nigel Rees",
>                "title": "Sayings of the Century",
>                "price": 8.95
>            },
>            {
>                "category": "fiction",
>                "author": "Evelyn Waugh",
>                "title": "Sword of Honour",
>                "price": 12.99
>            },
>            {
>                "category": "fiction",
>                "author": "Herman Melville",
>                "title": "Moby Dick",
>                "isbn": "0-553-21311-3",
>                "price": 8.99
>            },
>            {
>                "category": "fiction",
>                "author": "J. R. R. Tolkien",
>                "title": "The Lord of the Rings",
>                "isbn": "0-395-19395-8",
>                "price": 22.99
>            }
>        ],
>        "bicycle": {
>            "color": "red",
>            "price": 19.95
>        }
>    },
>    "expensive": 10
>}
>```
>
>| JsonPath (click link to try)| Result |
>| :------- | :----- |
>| <a href="http://jsonpath.herokuapp.com/?path=$.store.book[*].author" target="_blank">$.store.book[*].author</a>| The authors of all books     |
>| <a href="http://jsonpath.herokuapp.com/?path=$..author" target="_blank">$..author</a>                   | All authors                         |
>| <a href="http://jsonpath.herokuapp.com/?path=$.store.*" target="_blank">$.store.*</a>                  | All things, both books and bicycles  |
>| <a href="http://jsonpath.herokuapp.com/?path=$.store..price" target="_blank">$.store..price</a>             | The price of everything         |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[2]" target="_blank">$..book[2]</a>                 | The third book                      |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[2]" target="_blank">$..book[-2]</a>                 | The second to last book            |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[0,1]" target="_blank">$..book[0,1]</a>               | The first two books               |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[:2]" target="_blank">$..book[:2]</a>                | All books from index 0 (inclusive) until index 2 (exclusive) |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[1:2]" target="_blank">$..book[1:2]</a>                | All books from index 1 (inclusive) until index 2 (exclusive) |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[-2:]" target="_blank">$..book[-2:]</a>                | Last two books                   |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[2:]" target="_blank">$..book[2:]</a>                | Book number two from tail          |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.isbn)]" target="_blank">$..book[?(@.isbn)]</a>          | All books with an ISBN number         |
>| <a href="http://jsonpath.herokuapp.com/?path=$.store.book[?(@.price < 10)]" target="_blank">$.store.book[?(@.price < 10)]</a> | All books in store cheaper than 10  |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.price <= $['expensive'])]" target="_blank">$..book[?(@.price <= $['expensive'])]</a> | All books in store that are not "expensive"  |
>| <a href="http://jsonpath.herokuapp.com/?path=$..book[?(@.author =~ /.*REES/i)]" target="_blank">$..book[?(@.author =~ /.*REES/i)]</a> | All books matching regex (ignore case)  |
>| <a href="http://jsonpath.herokuapp.com/?path=$..*" target="_blank">$..*</a>                        | Give me every thing   
>| <a href="http://jsonpath.herokuapp.com/?path=$..book.length()" target="_blank">$..book.length()</a>                 | The number of books                      |

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
    - 不支持post请求
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
  - 支持相对路径或绝对路径
  - header在此类规则下才有意义
  - 当然，url 也属于字符串
  + 3.1 搜索结果地址(ruleSearchNoteUrl)
    - 必填
  + 3.2 目录地址(ruleChapterUrl)
    - 可空，此时使用搜索结果地址
  + 3.3 章节地址，或称正文地址(ruleContentUrl)
    - 必填
    - 若与目录同地址须填 `@js:""`
    - （尚未支持）~~上述地址都支持 @header:{key1:rule1,key2:rule2}~~
    - ~~与搜索url不同，这里的 rule 支持完整规则，需要用双引号包含起来。~~
    - 拼接处理直接写不可靠，如有需要请使用 `@js:js内容`
  + 3.4 封面地址，2个(ruleSearchCoverUrl, ruleCoverUrl)
    - 可空
    - 可能需要考虑 referer
  
### 4. 字符串
  - JSOUP规则下，如使用text结尾时，存在空白折叠，多个空格会被一个空格代替；如有需要，请改用html结尾
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
  - 规则首字符使用负号(`-`)可使列表反序
  - ~~转字符串时，列表以`"\r\n"`连接，可用`result.split("\r\n")`分割（不可靠）~~
  - 此处js返回值类型同时支持String和Array。
  - 若返回 Array 类型，对于搜索结果列表和目录，应形如`[{name:"one",id:1,...},...]`，其他应形如`["type1","type2",...]` 或 `["url1","url2",...]`
  - 若返回String类型，需用到js标签`<js>...;JSON.stringfy(list);</js>@json:$`，分类、下一页地址、正文建议直接返回 Array
  + 5.1 搜索结果列表(ruleSearchList)
    - 搜索结果系列规则从此列表往后写   
  + 5.2 目录列表(ruleChapterList)
    - 章节名称、url规则从此列表往后写
  + 5.3 分类，2个(ruleSearchKind, ruleBookKind)
    - ~~是的，这个不是字符串而是列表~~
    - ruleSearchKind为列表，ruleBookKind为字符串
  + 5.4 下一页地址，2个(ruleChapterUrlNext, ruleContentUrlNext)
    - ~~是的，这个也是列表~~
    - ruleChapterUrlNext为列表，ruleContentUrlNext为url
    - 依次向下一页地址发送请求，得到所有响应后开始下一步解析。
    - 需保证最后一页的规则取到内容为空，如有必要，请在规则中显式返回`null`或`""`。
    - 支持相对路径或绝对路径
  + 5.5 正文(ruleBookContent)
    - 不支持 @put
    - ~~不支持相对路径（唯一一处），可能需要补全 url~~
    - 异次元 1.4.8 (2019.03.28) 已支持相对url（$开始的规则放弃支持）
    
### 6. 图片 
  - 这部分与 url 和 list 重复，这里是补充说明
  - 独有关键字：host、prePage、thisPage
    - host 固定为1.2内容
    - prePage 根据3.给出的顺序计算
    - thisPage 为规则所在页面的地址
    - 格式为`rule@header:{referer:thisPage}`
  - referer不存在默认定义，不写referer时，请求头就不带referer
  + 6.1 封面地址，2个(ruleSearchCoverUrl, ruleCoverUrl)
  + 6.2 正文(ruleBookContent)
    
### 7. 通用
  + 7.1 五个连接符 `&, &&, |, ||, %`
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


