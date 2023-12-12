
export var XJ_Github = {
    //均通过api.github.com获取仓库资源数据
    //返回Promise的函数需使用then和catch处理异步数据。force参数为真时无视缓存直接请求api.github.com
    //获取成功：func_success(data)；获取失败：func_fail(statusCode,data)
    Get_Repos: (user, force = false) => Promise,//获取用户对应的repos(仓库内容)数据(通过api.github.com请求)
    Get_Readme: (user, repo, force = false) => Promise,//获取用户仓库对应的ReadMe数据(通过api.github.com请求)
    Get_Content: (user, repo, path, force = false) => Promise,//获取用户仓库指定路径下的资源内容(通过api.github.com请求)
    Opt_SaveUrl: (url, storageKey, storageTimeout, force = false) => Promise,//获取资源，并保存到缓存中。该函数主要供其他Get函数使用。(优先从缓存中获取资源)

    Get_XRatelimit: () => { },//获取数据请求相关信息。{remaining:<剩余次数>,reset:<请求重置时间-Date对象>}
    Get_RequestTime: () => Date,//获取一个Date，记录着Get_Repos、Get_Readme的时效性(每次向api.github.com请求数据时该值会发生更新)

    Trans_Repos: (data) => { },//转换数据，使其更易用(按最近提交时间降序排序)
    Trans_Readme: (data) => { },//转换数据，使其更易用
    Trans_Content: (data) => { },//转换数据，使其更易用
    Trans_DecodeContent: (data) => data,//readme内容转码：https://segmentfault.com/q/1010000000451621



    __Init: () => { },//初始化
    __UpdateRateTime: (resp) => { },//更新this.__XRateLimit。resp是请求成功后的Response对象
    __UpdateRequestTime: (key, updateCache, keepOld) => { },//更新this.__requestTime。updateCache为假时从缓存中获取数据，为真则更新缓存；keepOld为真时，仅在获取到的Date更旧时更新this.__requestTime
    __XRateLimit: {
        // total:['X-Ratelimit-Limit',60],//请求总次数(60次)
        remaining: ['X-Ratelimit-Remaining', 60],//请求剩余次数
        reset: ['X-Ratelimit-Reset', 0],//请求重置时间
    },
    __requestTime: new Date(),//调用Get_Repos和Get_Readme时刷新
    __configs: {
        repo: {
            url: 'https://api.github.com/users/$user/repos?per_page=$per_page&page=$page',
            storageKey: 'repos_$user_$page',
            storageTimeout: 15,
        },
        readme: {
            url: 'https://api.github.com/repos/$user/$repo/readme',
            storageKey: 'readme_$user_$readme',
            storageTimeout: 60 * 24 * 15,
        },
        content: {
            url: 'https://api.github.com/repos/$user/$repo/contents/$path/?ref=main',
            storageKey: 'content_$user_$repo_$path',
            storageTimeout: 60 * 24 * 15,
        },
        rateLimit: {
            storageKey: 'rateLimit',
            storageTimeout: 60 * 24 * 15,
        },
        requestTime: {
            storageKey: 'requestTime_$info',
            storageTimeout: 60 * 24 * 15,
        },
    }
}








import { XJ_Storage } from './XJ_Storage';

//readme内容转码：https://segmentfault.com/q/1010000000451621
function Trans_DecodeContent(data) {
    return decodeURIComponent(escape(atob(data)));
}


function Opt_SaveUrl(url, storageKey, storageTimeout, force = false) {
    let _this = this
    return new Promise((func_success, func_fail) => {
        if (!force) {
            let data = XJ_Storage.Get_Data(storageKey);
            if (data) {
                _this.__UpdateRequestTime(storageKey, false, true);
                func_success(data);
                return;
            }
        }

        console.info('RequestUrl：', url);
        fetch(url)
            .then((resp) => {
                _this.__UpdateRateTime(resp);
                if (resp.status == 200) {//请求成功
                    resp.text()//不知道为啥，居然返回的是Promise
                        .then((data) => {
                            data = JSON.parse(data)
                            XJ_Storage.Set_Data(storageKey, data, storageTimeout);
                            _this.__UpdateRequestTime(storageKey, true, true);
                            func_success(data);
                        })
                }
                else {//请求失败，直接返回Response进行后续处理
                    func_fail(resp);
                }
            })
            .catch((err) => {//请求失败。(能在fetch中catch到的都不是正常错误，而且还会自作主张地在控制台扔出错误，就不能好好地给我返个Promise？哪怕是个无效的也好啊
                func_fail({ 'status': 0, 'url': url, 'error': err })
            });
    });
}

function Get_Repos(user, force = false) {
    let per_page = 100;//一次最多请求100份数据，需要分批次获取
    let _this = this;
    let conf = this.__configs.repo;
    let storageTimeout = conf.storageTimeout
    let storageKey = conf.storageKey
        .replace('$user', user);
    let url = conf.url
        .replace('$user', user)
        .replace('$per_page', per_page);
    this.__requestTime = new Date();
    return new Promise((func_success, func_fail) => {
        function CreateGet() {
            let rst = [];
            function Get(page) {
                _this.Opt_SaveUrl(url.replace('$page', page), storageKey.replace('$page', page), storageTimeout, force)
                    .then((data) => {
                        rst = rst.concat(data);
                        if (data.length == per_page) {
                            Get(page + 1);
                        }
                        else {
                            func_success(rst);
                        }
                    })
                    .catch((resp) => {
                        func_fail(resp);
                    })
            }
            return Get;
        }
        let Get = CreateGet();
        Get(1);//不知道怎么回事，page=0和page=1是一样的
    });
}

function Get_Readme(user, repo, force = false) {
    let _this = this;
    let conf = this.__configs.readme;
    let storageTimeout = conf.storageTimeout;
    let storageKey = conf.storageKey
        .replace('$user', user)
        .replace('$readme', repo);
    let url = conf.url
        .replace('$user', user)
        .replace('$repo', repo);
    this.__requestTime = new Date();
    return new Promise((func_success, func_fail) => {
        _this.Opt_SaveUrl(url, storageKey, storageTimeout, force)
            .then((data) => {
                func_success(data);
            })
            .catch((resp) => {
                func_fail(resp);
            });
    })
}

function Get_Content(user, repo, path, force = false) {
    let _this = this;
    let conf = this.__configs.content;
    let storageTimeout = conf.storageTimeout;
    let storageKey = conf.storageKey
        .replace('$user', user)
        .replace('$repo', repo)
        .replace('$path', path);
    let url = conf.url
        .replace('$user', user)
        .replace('$repo', repo)
        .replace('$path', path);
    this.__requestTime = new Date();
    return new Promise((func_success, func_fail) => {
        _this.Opt_SaveUrl(url, storageKey, storageTimeout, force)
            .then((data) => {
                func_success(data);
            })
            .catch((resp) => {
                func_fail(resp);
            });
    })
}

function Get_XRatelimit() {
    let lm = this.__XRateLimit;
    let rst = {};
    let date = new Date();
    if (date > lm.reset[1] * 1000) {
        rst['reset'] = date;
        rst['remaining'] = 60;
    }
    else {
        rst['reset'] = lm.reset[1];
        rst['remaining'] = lm.remaining[1];
    }
    return rst;
}

function Get_RequestTime() {
    return this.__requestTime;
}

function Trans_Repos(data) {
    let rst = [];
    let keys = ['name', 'html_url', 'language', 'languages_url', 'visibility', 'created_at', 'pushed_at', 'private', 'contents_url', 'commits_url', 'updated_at', 'allow_forking', 'forks', 'fork', 'stargazers_count'];
    data.forEach(item => {
        let content = {};
        for (let key of keys)
            content[key] = item[key];
        rst.push(content);
    });

    let key = 'pushed_at';
    rst = rst.sort((a, b) => { return new Date(b[key]) - new Date(a[key]) });
    return rst;
}

function Trans_Readme(data) {
    return this.Trans_DecodeContent(data['content']);
}

function Trans_Content(data) {
    let _this = this;
    function Trans(data, isFile) {
        let content = {};
        let keys = ['name', 'type', 'size', 'html_url'];
        for (let key of keys)
            content[key] = data[key];
        if (isFile)
            content['content'] = _this.Trans_DecodeContent(data['content']);
        return content;
    }

    if (data.length) {//如果是数组，说明是目录
        return data.map((item) => Trans(item));
    }
    else {//文件
        return Trans(data, true);
    }
}

function __Init() {
    let conf = this.__configs.rateLimit;
    let data = XJ_Storage.Get_Data(conf.storageKey);
    if (data)
        this.__XRateLimit = data;
    this.__requestTime = new Date();
}

function __UpdateRateTime(resp) {
    let lm = this.__XRateLimit;
    let conf = this.__configs.rateLimit;
    for (let key in lm)
        lm[key][1] = eval(resp.headers.get(lm[key][0]));
    lm.reset[1] *= 1000;//秒转为毫秒，方便日期处理
    XJ_Storage.Set_Data(conf.storageKey, lm, conf.storageTimeout);
}

function __UpdateRequestTime(key, updateCache, keepOld) {
    let date = new Date();
    let conf = this.__configs.requestTime;
    key = conf.storageKey.replace('$info', key);
    if (updateCache) {
        XJ_Storage.Set_Data(key, new Date().getTime(), conf.storageTimeout);
    }
    else {
        let d = new Date(XJ_Storage.Get_Data(key));
        if (d)
            date = d;
    }
    if (keepOld) {
        if (this.__requestTime < date)
            return;
    }
    this.__requestTime = date;
}


XJ_Github.Trans_Readme = Trans_Readme
XJ_Github.Trans_Repos = Trans_Repos
XJ_Github.Trans_DecodeContent = Trans_DecodeContent;
XJ_Github.Trans_Content = Trans_Content;
XJ_Github.Get_Repos = Get_Repos;
XJ_Github.Get_Readme = Get_Readme;
XJ_Github.Get_Content = Get_Content;
XJ_Github.Opt_SaveUrl = Opt_SaveUrl;
XJ_Github.Get_RequestTime = Get_RequestTime;
XJ_Github.Get_XRatelimit = Get_XRatelimit;
XJ_Github.__UpdateRateTime = __UpdateRateTime;
XJ_Github.__UpdateRequestTime = __UpdateRequestTime;
XJ_Github.__Init = __Init;

XJ_Github.__Init();


