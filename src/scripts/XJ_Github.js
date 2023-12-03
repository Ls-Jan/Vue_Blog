
export var XJ_Github={
    //获取成功：func_success(data)；获取失败：func_fail(statusCode,data)
    Get_Repos:(user,force=false)=>Promise,//获取用户对应的repos(仓库内容)，使用then和catch处理异步数据。force为真时无视缓存直接请求api.github.com
    Get_Readme:(user,repo,force=false)=>Promise,//获取仓库对应的ReadMe(仓库内容)，使用then和catch处理异步数据。force为真时无视缓存直接请求api.github.com
    Get_Ratelimit:()=>{},//获取数据请求相关信息。{total:<总次数>,remaining:<剩余次数>,reset:<距离重置剩余秒数>}
    Get_RequestTime:()=>Date,//获取一个Date，记录着Get_Repos、Get_Readme的时效性(每次向api.github.com请求数据时该值会发生更新)

    Trans_Repos:(data)=>{},//转换数据，使其更易用(按最近提交时间降序排序)
    Trans_Readme:(data)=>{},//转换数据，使其更易用
    Trans_DecodeContent:(data)=>data,//readme内容转码：https://segmentfault.com/q/1010000000451621



    
    __Init:()=>{},//初始化
    __UpdateRateTime:(req)=>{},//更新this.__rateLimit。req是请求成功后的XMLHttpRequest对象
    __UpdateRequestTime:(key,updateCache,keepOld)=>{},//更新this.__requestTime。updateCache为假时从缓存中获取数据，为真则更新缓存；keepOld为真时，如果获取到的Date更新则不会更新this.__requestTime
    __rateLimit:{
        total:['X-Ratelimit-Limit',60],//请求总次数(60次)
        remaining:['X-Ratelimit-Remaining',60],//请求剩余次数
        reset:['X-Ratelimit-Reset',0],//请求重置时间
    },
    __requestTime:new Date(),//调用Get_Repos和Get_Readme时刷新
    __configs:{
        repo:{
            url:'https://api.github.com/users/$user/repos?per_page=$per_page&page=$page',
            storageKey:'repos_$user_$page',
            storageTimeout:15,
        },
        readme:{
            url:'https://api.github.com/repos/$user/$repo/readme',
            storageKey:'readme_$user_$readme',
            storageTimeout:60*24*15,
        },
        rateLimit:{
            storageKey:'rateLimit',
            storageTimeout:60*24*15,
        },
        requestTime:{
            storageKey:'requestTime_$info',
            storageTimeout:60*24*15,
        },
    }
}








import {XJ_Storage} from './XJ_Storage';

//readme内容转码：https://segmentfault.com/q/1010000000451621
function Trans_DecodeContent(data){
    return decodeURIComponent(escape(atob(data)));
}


function Get_Repos(user,force=false){
    let obj=this;
    let conf=this.__configs.repo;
    let storageKey=conf.storageKey.replace('$user',user);
    this.__requestTime=new Date();
    return new Promise((func_success, func_fail) => {
        function CreateGet(){
            let per_page=100;//一次最多请求100份数据，需要分批次获取
            let url=conf.url
                        .replace('$user',user)
                        .replace('$per_page',per_page);
            let rst=[];
            function Get(page){
                storageKey=storageKey.replace('$page',page);
                if(!force){//如果非强制加载，从缓存读取
                    let data=XJ_Storage.Get_Data(storageKey);
                    if(data){//如果有缓存
                        rst=rst.concat(data);
                        obj.__UpdateRequestTime(storageKey,false,true);
                        if(data.length==per_page){
                            Get(page+1);
                        }
                        else{
                            func_success(rst);
                        }
                        return;
                    }
                }
                //没有缓存，去请求数据
                let req = new XMLHttpRequest();
                req.onreadystatechange = (e) => {
                    if(req.readyState==4){
                        let data=JSON.parse(req.responseText);
                        if(req.status==200){
                            if(data && data.length){
                                rst=rst.concat(data);
                                XJ_Storage.Set_Data(storageKey,data,conf.storageTimeout);
                                obj.__UpdateRateTime(req);
                                obj.__UpdateRequestTime(storageKey,true,true);
                                if(data.length==per_page)
                                    Get(page+1);
                                else
                                    func_success(rst);
                            }
                        }
                        else{
                            func_success(rst);//发送已加载的数据
                            func_fail(req.status,data);//大概率触发403。0值说明无网络
                        }
                    }
                };
                req.open("GET", url.replace('$page',page));
                req.send();
            }
            return Get;
        }
        let Get=CreateGet();
        Get(0);
    });
}
 
function Get_Readme(user,repo,force=false){
    let obj=this
    let conf=this.__configs.readme;
    let storageKey=conf.storageKey
                    .replace('$user',user)
                    .replace('$readme',repo);
    let url=conf.url
                    .replace('$user',user)
                    .replace('$repo',repo);
    this.__requestTime=new Date();
    return new Promise((func_success, func_fail) => {
        if(!force){//如果非强制加载，从缓存读取
            let data=XJ_Storage.Get_Data(storageKey);
            if(data){//如果有缓存
                obj.__UpdateRequestTime(storageKey,false,true);
                func_success(data);
                return;
            }
        }
        //没有缓存，去请求数据
        let req = new XMLHttpRequest();
        req.onreadystatechange = (e) => {
            if(req.readyState==4){
                let data=JSON.parse(req.responseText);
                if(req.status==200){
                    if(data){
                        XJ_Storage.Set_Data(storageKey,data,conf.storageTimeout);
                        obj.__UpdateRateTime(req);
                        obj.__UpdateRequestTime(storageKey,true,true);
                        func_success(data);
                        return;
                    }
                }
                func_fail(req.status,data);//大概率触发403。0值说明无网络
            }
        };
        req.open("GET", url);
        req.send();
    })
}

function Trans_Repos(data){
    let rst=[];
    let keys=['name','html_url','language','visibility','created_at','pushed_at','private','contents_url','commits_url','fork'];
    data.forEach(item=>{
        let content={};
        for(let key of keys)
            content[key]=item[key];
        rst.push(content);
    });

    let key='pushed_at';
    rst=rst.sort((a,b)=>{return new Date(b[key])-new Date(a[key])});
    return rst;
}

function Trans_Readme(data){
    return this.Trans_DecodeContent(data['content']);
}

function Get_Ratelimit(){
    let lm=this.__rateLimit;
    let rst={};
    let time=lm.reset[1]-new Date().getTime()/1000;
    if(time>0){
        rst['reset']=eval(time.toFixed(2));
        rst['total']=lm.total[1];
        rst['remaining']=lm.remaining[1];
    }
    else{
        rst['reset']=0;
        rst['total']=60;
        rst['remaining']=60;
    }
    return rst;
}

function Get_RequestTime(){
    return this.__requestTime;
}

function __Init(){
    let conf=this.__configs.rateLimit;
    let data=XJ_Storage.Get_Data(conf.storageKey);
    if(data)
        this.__rateLimit=data;
    this.__requestTime=new Date();
}

function __UpdateRateTime(req){
    let lm=this.__rateLimit;
    let conf=this.__configs.rateLimit;
    for(let key in lm)
        lm[key][1]=eval(req.getResponseHeader(lm[key][0]));
    XJ_Storage.Set_Data(conf.storageKey,lm,conf.storageTimeout);
}

function __UpdateRequestTime(key,updateCache,keepOld){
    let date=new Date();
    let conf=this.__configs.requestTime;
    key=conf.storageKey.replace('$info',key);
    if(updateCache){
        XJ_Storage.Set_Data(key,new Date().getTime(),conf.storageTimeout);
    }
    else{
        let d=new Date(XJ_Storage.Get_Data(key));
        if(d)
            date=d;
    }
    if(keepOld){
        // console.clear()
        // console.log(this.__requestTime)
        // console.log(date)
        if(this.__requestTime<date)
            return;
    }
    this.__requestTime=date;
}


XJ_Github.Trans_Readme=Trans_Readme
XJ_Github.Trans_Repos=Trans_Repos
XJ_Github.Trans_DecodeContent=Trans_DecodeContent;
XJ_Github.Get_Repos=Get_Repos;
XJ_Github.Get_Readme=Get_Readme;
XJ_Github.Get_RequestTime=Get_RequestTime;
XJ_Github.Get_Ratelimit=Get_Ratelimit;
XJ_Github.__UpdateRateTime=__UpdateRateTime;
XJ_Github.__UpdateRequestTime=__UpdateRequestTime;
XJ_Github.__Init=__Init;

XJ_Github.__Init();


