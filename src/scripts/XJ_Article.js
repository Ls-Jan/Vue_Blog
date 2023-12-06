

import { ref , watch } from 'vue'

export var XJ_Article={
    data_navList:ref([]),//文章导航栏列表
    data_navLoadTip:ref(''),//文章导航栏加载提示(加载中，或者加载失败)
    data_navIndex:ref(-1),//文章导航栏索引值，与导航栏绑定。该值的更新会修改article
    data_article:ref(''),//文章内容
    data_meta:ref({}),//与文章相关的Meta数据

    stat_NavShow:ref(false),//文章导航栏的显示状态
    stat_OptResult:ref(1),//取值有3种：操作中(0)、操作成功(1)、操作失败(-1)
    stat_UpdateTime:ref({'nav':new Date(),'article':new Date()}),//【Github仓库】记录导航栏和文章的更新时间
    stat_XRateLimit:ref({'reset':new Date(),'remaining':60}),//【Github仓库】记录api.github.com的限流情况，remaining为剩余请求次数，reset为请求重置的时间

    Opt_UpdateNav:(github=false,blog=false,force=false)=>{},//更新导航栏内容(以及文章内容)，如果传入的两值均为False那么视为“显示主页”并隐藏导航栏
    Opt_UpdateArticle:(force=true)=>{},//【Github仓库】强制更新当前文章
    Trans_Markdown:(data)=>{},//将md文本渲染为html



    __navType:'github',//github和blog二选一
    __user:'Ls-Jan',//博客用户
    __navList:[],//导航栏初始数据

    //处理数据请求失败时的信息
    __Fail_BlogNav:(status,url)=>{},
    __Fail_BlogArticle:(status,url)=>{},
    __Fail_GithubNav:(status,url)=>{},
    __Fail_GithubArticle:(status,url)=>{},
}

const brief_Home=
`
    XJ的个人主页
`

const brief_Github=
`
    XJ的GitHub仓库,展示项目的Readme内容。
`

const brief_Blog=
`
    XJ的博客,东西不多。
`

const fail_Load=
`
    数据获取失败！
`









import {XJ_Storage} from './XJ_Storage'
import {XJ_Github} from './XJ_Github'

//使用 MarkedJS 渲染 Markdown：https://juejin.cn/post/7273685848604885007
import {marked} from "marked"; // 引入marked
import {markedHighlight} from "marked-highlight"
import hljs from "highlight.js"; // 引入 highlight.js
import "highlight.js/styles/github-dark-dimmed.css"; // 引入高亮样式

//不知道为什么，marked.setOptions关于highlight的设置并没有效果。可能是更新了？
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'shell';
        return hljs.highlight(code, { language }).value
    }
}))


function Opt_UpdateNav(github=false,blog=false,force=false){
    this.data_navLoadTip.value='正在加载中...';
    this.stat_OptResult.value=0;
    if(github){
        this.stat_NavShow.value=true;
        this.data_article.value=brief_Github;
        this.__navType='github';
        XJ_Github.Get_Repos(this.__user,force)
            .then((data)=>{
                data=XJ_Github.Trans_Repos(data);
                this.__navList=data;
                this.data_navIndex.value=-1;
                this.data_navList.value=data.map((item)=>item['name']);
                this.stat_OptResult.value=1;
                this.stat_XRateLimit.value=XJ_Github.Get_XRatelimit();
                this.stat_UpdateTime.value['nav']=XJ_Github.Get_RequestTime();
            })
            .catch((resp)=>{
                this.__Fail(resp.status,resp.url,true);
                this.stat_OptResult.value=-1;
            })
    }
    else if(blog){
        this.stat_NavShow.value=true;
        this.data_article.value=brief_Blog;
        this.__navType='blog';
        let url='https://$user.github.io/Blog/BlogList.json'//懒得搞相对路径获取，反正都一样
        url=url.replace('$user',this.__user);
        fetch(url)
            .then((resp) =>{
                if(resp.status==200){//请求成功
                    resp.text()//data.text()仅仅是个Promise，还需.then方法进一步获取数据
                        .then((data)=>{
                            data=JSON.parse(data);
                            let lst=[];
                            for(let name in data)//为了保留排序，不使用字典
                                lst.push([name,data[name]]);
                            this.__navList=lst;
                            this.data_navIndex.value=-1;
                            this.data_navList.value=lst.map((item)=>item[0]);
                            this.stat_OptResult.value=1;            
                        })
            }})
            .catch((err)=>{//fetch在无法获取资源时将返回一段字符串，不会说明fetch失败的详细原因，需要浏览器开F12去Debug
                this.__Fail(0,url,true);
                this.stat_OptResult.value=-1;
            });
    }
    else{
        this.stat_NavShow.value=false;
        this.data_article.value=brief_Home;
        this.stat_OptResult.value=1;
    }
}

function Opt_UpdateArticle(force=true){
    this.data_article.value='正在加载中...';
    let index=this.data_navIndex.value;
    let name=this.data_navList.value[index];
    this.stat_OptResult.value=0;
    if(this.__navType=='github'){
        XJ_Github.Get_Readme(this.__user,name,force)
            .then((data)=>{
                data=XJ_Github.Trans_Readme(data);
                this.data_article.value=XJ_Article.Trans_Markdown(data);
                this.data_meta.value=this.__navList[index];
                this.stat_XRateLimit.value=XJ_Github.Get_XRatelimit();
                this.stat_UpdateTime.value['nav']=XJ_Github.Get_RequestTime();
                this.stat_OptResult.value=1;
            })
            .catch((resp)=>{
                this.__Fail(resp.status,resp.url,false);
                this.stat_OptResult.value=-1;
            });
    }
    else if(this.__navType=='blog'){
        //原计划是打算通过获取readme.md文本内容再进行渲染处理的，但发现github.io会很聪明地把Readme.md渲染成html。
        //只不过试了下又感觉没啥区别(而且从readme.md文件中读取的话内容更加可控)，于是作为备选方案留下这代码
        let fromReadme=true;
        let data=this.__navList[index];
        let url='https://$user.github.io/Blog/$name'
                    .replace('$user',this.__user)
                    .replace('$name',name)
        if(fromReadme)
            url+='/$file_md'
        if(data){
            data=data[1];
            let file_md="";
            for(file_md in data){
                if(file_md.toLowerCase()=='readme.md')
                    break;
            }
            url=url.replace('$file_md',file_md);
            if(file_md.length){
                fetch(url)
                    .then((resp) =>{
                        if(resp.status==200){//请求成功
                            resp.text()//data.text()仅仅是个Promise，还需.then方法进一步获取数据
                                .then((data)=>{
                                    if(fromReadme)
                                        this.data_article.value=XJ_Article.Trans_Markdown(data);
                                    else
                                        this.data_article.value=data;
                                    this.data_meta.value=this.__navList[index];
                                    this.stat_OptResult.value=1;
                        })
                    }})
                    .catch((err)=>{//fetch在无法获取资源时将返回一段字符串，不会说明fetch失败的详细原因，需要浏览器开F12去Debug
                        this.__Fail(0,url,false);
                        this.stat_OptResult.value=-1;
                    });
            }
            else{
                this.__Fail(404,url,false);
                this.stat_OptResult.value=-1;
            }
        }
        else{
            this.data_article.value='索引值异常：XJ_Article.data_navIndex的值为$index，为无效值！'.replace('$index',index);//这个是非常规报错，不好用this.__Fail带过
            this.stat_OptResult.value=-1;
        }
    }
}

function Trans_Markdown(data){
    return marked(data);// 将markdown内容解析
}

function Get_FailResp(){
    return this.__failResp;
}



function __Fail(status,url,fromNavLoad){
    let fromBlog=this.__navType=='blog';
    let hint='$status：'.replace('$status',status);
    switch(status){
        case 404:{
            hint+='$type资源不存在！ '.replace('$type',fromBlog?'博客':'GitHub仓库');
            hint+='https://github.com/'+url.substr(url.indexOf(this.__user));
            hint+=" ";     
            break;
        }
        case 0:{
            hint+='网络异常，或是资源请求有误！ '
            hint+=url;
            hint+=" ";     
            break;
        }
        default:{

            hint+='其他错误';
        }
    }    

    if(fromNavLoad)
        this.data_navLoadTip.value=hint;
    else
        this.data_article.value=hint;
}

watch(XJ_Article.data_navIndex,()=>{
    XJ_Article.Opt_UpdateArticle(false);
})


XJ_Article.Opt_UpdateNav=Opt_UpdateNav;
XJ_Article.Opt_UpdateArticle=Opt_UpdateArticle;
XJ_Article.Trans_Markdown=Trans_Markdown;
XJ_Article.Get_FailResp=Get_FailResp;
XJ_Article.__Fail=__Fail;
XJ_Article.data_article.value=brief_Home;

