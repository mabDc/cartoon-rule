## 规则支持详解
### 从具体实现或图源写法上，分为7类
  - 1 图源描述（名称、地址、分组、登录、ua）
  - 2 搜索（发现和搜索地址）
  - 3 url（搜索结果地址、目录地址、章节地址）
  - 4 字符串（2个书名、2个作者、2个最新章节、1个简介、1个章节名称）
  - 5 列表（搜索结果列表、目录列表、2个分类、2个下一页地址）
  - 6 图片（2个封面地址+1个正文）
  - 7 通用（连接符、正则替换、js脚本、@put、@get）
  
### 0. 坑点
  + JSONPath 
    - 形式 `@JSon:jsonPath` 或 `jsonPath` 或 `{$.jsonPath}`
    - 标准规范 [goessner JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)
    - 实现库 [(github) json-path/JsonPath](https://github.com/json-path/JsonPath)
  + XPath
    - 形式 `@XPath:xpath` 或 `//xpath`
    - 标准规范 [W3C XPATH 1.0](https://www.w3.org/TR/1999/REC-xpath-19991116/) 
    - 实现库 [(github) zhegexiaohuozi/JsoupXpath](https://github.com/zhegexiaohuozi/JsoupXpath)
  + JSOUP
    - 形式 `@css:jsoup` 或 `class.chapter@tag.a!0` 或 `class.article.0@tag.p@text`
    - 标准规范与实现库 [Package org.jsoup.select, CSS-like element selector](https://jsoup.org/apidocs/org/jsoup/select/Selector.html)
  + 自定义五个连接符：`&, &&, |, ||, %`
  + 不支持动态内容，所有的规则解析以静态加载的内容为准(阅读支持动态内容，首字符用$表示动态加载)
  + 规则形式为 `rule@header:{key:rule}@get:{key}@put:{key:rule}@js:`
  + 规则解析顺序为 @put -> @get -> @header -> rule -> @js
  + 前三个@不能嵌套，位置任意，@js必须放在最后
  
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
  - 拥有 url 类的全部特性。这里仅给出独有的特性。
  - 该类型关键字有 searchKey 和 searchPage 。
  - searchPage 同时还支持 searchPage-1 和 searchPage+1。
  + 2.1 发现(ruleFindUrl)
    - 形式为 `name::url`
    - 多个规则用 && 或 换行符 连接
    - 规则中若不含 `searchPage` 关键字，发现中持续下拉将循环。
    - 页数写法支持```{1, 2, 3, }```，发现中持续下拉将依次加载第一页、第二页、等。
    - 若为空或语法错误，刷新发现后，分组(1.3)将自动给出标注。
    - 不支持post请求
  + 2.2 搜索地址(ruleSearchUrl)
    - 必填
    - 如无搜索地址，则填入占位符`#`
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
    - 请求头支持多个规则，如 @header:{key1:val1,key2:val2}。
    - 规则中可以不带 `searchKey` 和 `searchPage`。
    - 只支持单个规则，部分漫画搜名称和搜作者用的不同搜索地址，需要做成2个图源。
    
### 3. url
  + 3.1 搜索结果地址(ruleSearchNoteUrl)
    - 必填
  + 3.2 目录地址(ruleChapterUrl)
    - 可空，此时使用搜索结果地址
  + 3.3 章节地址，或称正文地址(ruleContentUrl)
    - 必填
    - 若与目录同地址须填 `@js:""`
    - 上述地址都支持 @header:{key1:rule1,key2:rule2}
    - 与搜索url不同，这里的 rule 支持完整规则，需要用双引号包含起来。
    - 拼接处理直接写不可靠，如有需要请使用 `@js:js内容`
    
### 4. 字符串
  - 存在空白压缩或空白折叠
  + 4.1 书名，2个(ruleSearchName, ruleBookName)
  + 4.2 作者，2个(ruleSearchAuthor, ruleBookAuthor)
    - 上述2个内容都存在空白压缩，包括 {}、[]、【】等全部会被舍弃。
    - 作为一本书的联合ID，用于判定搜索结果是否属于同一本书。
  + 4.3 最新章节，2个(ruleSearchLastChapter, ruleBookhLastChapter)
  + 4.4 简介(ruleIntroduce)
  + 4.5 章节名称(ruleChapterName)
    - 上述3个内容都存在空白折叠，多个空格会被一个空格代替。
    - 章节名称常用正则替换规则为 `#^.*\s|^\D*(?=\d)`
    - 书名或章节名称取到内容为空时会导致该书或章节被忽略。
    
### 5. 列表
  - 规则首字符使用负号(`-`)可使列表倒序
  - 转字符串时，列表以`"\r\n"`连接，可用`result.split("\r\n")`分割
  - 此处js返回值类型同时支持String和Array。建议用Array，若返回String类型，需用到js标签`<js>...;JSON.stringfy(list);</js>@json:$`
  + 5.1 搜索结果列表(ruleSearchList)
    - 搜索结果系列规则从此列表往后写
  + 5.2 目录列表(ruleChapterList)
    - 章节名称、url规则从此列表往后写
  + 5.3 分类，2个(ruleSearchKind, ruleBookKind)
    - 是的，这个不是字符串而是列表
    - js返回值类型支持字符串数组，不支持对象数组
  + 5.4 下一页地址，2个(ruleChapterUrlNext, ruleContentUrlNext)
    - 是的，这个也是列表
    - 依次向下一页地址发送请求，得到所有响应后开始下一步解析。
    - 需保证最后一页的规则取到内容为空，如有必要，请在规则中显式返回null。
    - js返回值类型支持字符串数组，不支持对象数组
    
### 6. 图片 
  - 独有关键字：host、prePage、thisPage
  - host 固定为1.2内容
  - prePage 根据3.给出的顺序计算
  - thisPage 为规则所在页面的地址
  + 6.1 封面地址，2个(ruleSearchCoverUrl, ruleCoverUrl)
  + 6.2 正文(ruleBookContent)
    - 格式为rule@header:{referer:thisPage}
    - header可省略，此时请求将不带referer
    
### 7. 通用
  + 7.1 五个连接符 `&, &&, |, ||, %`
  + 7.2 正则替换
    - 形式为 `#match#replace`
    - `#replace` 可省略，此时将使用默认值`""`
    - 使用的方法为 replaceAll，即全局循环匹配
  + 7.3 js脚本
    - 形式为 `rule@js:js内容` 或 `rule1<js>js内容1</js>rule2<js>js内容2</js>rule3`
    - 包含 `result` 和 `baseUrl` 2个`java.lang.string`对象，`baseUrl` 为规则所在页url（非常可靠）
    - 由于参数以对象传递，js选手使用`replace()`和`split()`和`match()`方法前需用`new String()`做类型转换，java选手不需要转换。
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
      var jsonObject = JSON.parse(json);
      var jsonString = JSON.stringify(jsonObject);
      // 验证变量存在
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


