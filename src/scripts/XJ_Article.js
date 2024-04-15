
import { ref, watch } from 'vue'
import { XJ_Github } from './XJ_Github'

//【耦合重灾区】
export var XJ_Article = {
	data_navList: ref([]),//文章导航栏列表
	data_navLoadTip: ref(''),//文章导航栏加载提示(加载中，或者加载失败)
	data_navIndex: ref([]),//文章导航栏索引值，与导航栏绑定。该值的更新会修改article。空取值将显示默认信息。
	data_article: ref(''),//文章内容（md文本已经渲染为html
	data_meta: ref({}),//与文章相关的Meta数据。
	//data_meta可能的键以及对应内容：
	//name(名称/标题)、url(源链接)、cTime(创建时间)、mTime(修改时间)
	//struct(Blog资源树)、language(项目主要编程语言)、stars(项目星星数)
	//isforked(项目是fork的)、allowforking(项目可否被fork)、forks(项目fork数)

	stat_NavShow: ref(false),//文章导航栏的显示状态
	stat_OptResult: ref({ 'nav': 1, 'article': 1 }),//取值有3种：操作中(0)、操作成功(1)、操作失败(-1)
	stat_UpdateTime: ref({ 'nav': new Date(), 'article': new Date() }),//【Github仓库】记录导航栏和文章的更新时间
	stat_XRateLimit: ref({ 'reset': new Date(), 'remaining': 60 }),//【Github仓库】记录api.github.com的限流情况，remaining为剩余请求次数，reset为请求重置的时间

	Opt_UpdateNav: (github = false, blog = false, force = false) => { },//【小改，返回Promise】。更新导航栏内容(以及文章内容)，如果传入的两值均为False那么视为“显示主页”并隐藏导航栏
	Opt_UpdateArticle: (force = true) => { },//【Github仓库】强制更新当前文章
	Trans_Markdown: (data, rootUrl = './') => { },//将md文本渲染为html。并将其中的图片路径全部转换为有效路径以便资源成功加载
	Test_HasReadme: (index) => { },//【模块设计纰漏】【补丁行为】判断Blog的index路径是否有Readme.md文件

	__navType: 'github',//github和blog二选一
	__user: 'Ls-Jan',//博客用户
	__navList: [],//导航栏初始数据
	__promise: null,//与设置this.data_article有关的Promise

	__Fail: (status, url, fromNavLoad) => { },//处理数据请求失败时的信息
	__Trans_BlogList: (data) => { },//将获取到的BlogList.json数据转换为ElTree对应的数据
	__Trans_RepoList: (data) => { },//将获取到的Github仓库项目列表转换为ElTree对应的数据
	__Trans_Struct: (data) => { },//将形如{'file1':'','dir1':{'file2':''}}的数据转换为ElTree对应的数据
	__Get_Meta: (index) => { },//根据__navList获取index对应的data_meta数据
	__Get_Promise: () => { },//一份巧妙的代码，可以可控地中断Promise行为：https://juejin.cn/post/6847902216028848141
}













//使用 MarkedJS 渲染 Markdown：https://juejin.cn/post/7273685848604885007
import { marked } from "marked"; // 引入marked
import { markedHighlight } from "marked-highlight"
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




function Opt_UpdateNav(github = false, blog = false, force = false) {
	return new Promise((success, fail) => {
		this.data_navLoadTip.value = '加载中...';
		this.data_navList.value = [];
		this.stat_OptResult.value['article'] = 1;
		this.stat_OptResult.value['nav'] = 0;
		this.data_article.value = '';
		this.__promise.abort();
		if (github) {
			this.stat_NavShow.value = true;
			this.__navType = 'github';
			this.__promise = this.__Get_Promise(XJ_Github.Get_Repos(this.__user, force));
			this.__promise
				.then((data) => {
					data = XJ_Github.Trans_Repos(data);
					this.__navList = data;
					this.data_navList.value = this.__Trans_RepoList(data);
					this.data_navIndex.value = [];
					this.stat_OptResult.value['nav'] = 1;
					this.stat_XRateLimit.value = XJ_Github.Get_XRatelimit();
					this.stat_UpdateTime.value['nav'] = XJ_Github.Get_RequestTime();
					success();
				})
				.catch((resp) => {
					if (resp != null) {//仅在主动中断Promise的时候resp为null
						this.__Fail(resp.status, resp.url, true);
						this.stat_OptResult.value['nav'] = -1;
					}
				})
		}
		else if (blog) {
			this.stat_NavShow.value = true;
			this.__navType = 'blog';
			let url = './Blog/BlogList.json';
			this.__promise = this.__Get_Promise(fetch(url));
			this.__promise
				.then((resp) => {
					if (resp.status == 200) {//请求成功
						resp.text()//data.text()仅仅是个Promise，还需.then方法进一步获取数据
							.then((data) => {
								data = JSON.parse(data);
								this.__navList = data;
								this.data_navList.value = this.__Trans_BlogList(data);
								this.data_navIndex.value = [];
								this.stat_OptResult.value['nav'] = 1;
								success();
							})
					} else {
						this.__Fail(resp.status, url, true);
						this.stat_OptResult.value['nav'] = -1;
						fail();
					}
				})
				.catch((err) => {//fetch在无法获取资源时将返回一段字符串(例如连接超时、无网络之类的
					if (err != null) {//等于null的情况是主动中断Promise的时候
						this.__Fail(0, url, true);
						this.stat_OptResult.value['nav'] = -1;
						fail();
					}
				});
		}
		else {
			this.data_navIndex.value = [];
			this.stat_NavShow.value = false;
			this.stat_OptResult.value['nav'] = 1;
			success();
		}
	});
}


function Opt_UpdateArticle(force = true) {
	let index = this.data_navIndex.value;
	this.stat_OptResult.value['article'] = 0;
	this.stat_OptResult.value['nav'] = 1;
	let meta = this.__Get_Meta(index);
	this.data_meta.value = meta;

	this.data_article.value = '';
	this.__promise.abort();
	if (this.stat_NavShow.value) {
		if (index.length) {
			if (this.__navType == 'github') {
				this.__promise = this.__Get_Promise(XJ_Github.Get_Readme(this.__user, index.join('/'), force));
				this.__promise
					.then((data) => {
						let url = data['url'];
						//【新增】帝皇级待遇，对url进行一波处理。
						// 项目放三个月就记不清很多内容，只不过虽然记不清'api.github.com'是怎么来的，至少简单看了下它是由XJ_Github.Get_Readme造成的残留，
						// 这里就对形如“https://api.github.com/repos/Ls-Jan/PyQt_GIFCreator/contents/README.md?ref=main”进行简单粗暴的替换，
						// 替换成“https://githubraw.com/Ls-Jan/PyQt_GIFCreator/main/”就能投入使用了
						if (url.indexOf('api.github.com') != -1) {//虽然这里没必要进行字符串判断，小防一手，反正也不碍事
							let branch = url.substr(url.lastIndexOf('?ref=') + '?ref='.length);
							url = url.replace('/api.github.com/repos/', '/githubraw.com/');
							url = url.replace('/contents/', '/' + branch + '/');
						}
						data = XJ_Github.Trans_Readme(data);
						this.data_article.value = this.Trans_Markdown(data, url.substr(0, url.lastIndexOf('/')));
						this.stat_XRateLimit.value = XJ_Github.Get_XRatelimit();
						this.stat_UpdateTime.value['article'] = XJ_Github.Get_RequestTime();
						this.stat_OptResult.value['article'] = 1;
					})
					.catch((resp) => {
						this.stat_UpdateTime.value['article'] = XJ_Github.Get_RequestTime();
						this.stat_XRateLimit.value = XJ_Github.Get_XRatelimit();
						if (resp != null) {//等于null的情况是主动中断Promise的时候
							this.__Fail(resp.status, resp.url, false);
							this.stat_OptResult.value['article'] = -1;
						}
					});
			}
			else if (this.__navType == 'blog') {
				//原计划是打算通过获取readme.md文本内容再进行渲染处理的，但发现通过$user.github.io的话能直接获取到渲染后的html。
				//只不过试了下又感觉没啥区别(而且从readme.md文件中读取的话内容更加可控)，然后就删掉了
				let url = './Blog/$name/$file_md'
					.replace('$name', index.join('/'))
				if (Object.keys(meta).length) {
					let file_md = "";
					for (let node of meta['struct']) {
						let name = node.label;
						if (name.toLowerCase() == 'readme.md') {
							file_md = name;
							break;
						}
					}
					if (file_md.length) {
						url = url.replace('$file_md', file_md);
						this.__promise = this.__Get_Promise(fetch(url));
						this.__promise
							.then((resp) => {
								if (resp.status == 200) {//请求成功
									resp.text()//data.text()仅仅是个Promise，还需.then方法进一步获取数据
										.then((data) => {
											this.data_meta.value = meta;
											this.data_article.value = this.Trans_Markdown(data, url.substr(0, url.lastIndexOf('/')));
											this.stat_UpdateTime.value['article'] = new Date();
											this.stat_OptResult.value['article'] = 1;
										})
								} else {
									this.__Fail(resp.status, url, false);
									this.stat_OptResult.value['article'] = -1;
								}
							})
							.catch((err) => {//fetch在无法获取资源时将返回一段字符串(例如连接超时、无网络之类的
								if (err != null) {//等于null的情况是主动中断Promise的时候
									this.__Fail(0, url, false);
									this.stat_OptResult.value['article'] = -1;
								}
							});
					}
					else {
						url = url.replace('$file_md', 'Readme.md');
						this.__Fail(404, url, false);
						this.stat_OptResult.value['article'] = -1;
					}
				}
				else {
					this.data_article.value = '索引值异常：XJ_Article.data_navIndex的值为[$index]，为无效值！'.replace('$index', index);//这个是非常规报错，不好用this.__Fail带过
					this.stat_OptResult.value['article'] = -1;
				}
			}
		}
	}
}

function Trans_Markdown(data, rootUrl = './') {
	//根据该网站获取github的raw链接，绕开CORS问题https://githubraw.com/
	//在线核对正则表达式
	let reLst = [//依次把图片链接替换
		[/(?<=<\s*img\s+src\s*=\s*['"]\s*)\./g, rootUrl],//替换形如<img src="./A/B/C">
		[/(?<=\[.*\]\().(?=\/)/g, rootUrl],//替换形如[...](./A/B/C)。因为除了图片外，md语法中还有个超链接语法[XXX](url)，这个也是要规避的
		[/(?<=https:\/\/github.com\/.*?\/.*?\/)blob\//g, ''],//将图片链接中出现的blob/路径去除掉
		[/(?<=<\s*img\s+src\s*=\s*['"]\s*https:\/\/)github.com/g, 'githubraw.com'],//替换形如<img src="https://github.com/XXX">
		[/(?<=\!\[.*\]\(https:\/\/)github.com(?=\/)/g, 'githubraw.com'],//替换形如![...](https://github.com/XXX)>
	]
	reLst.forEach((item) => {
		data = data.replace(item[0], item[1]);
	})
	data = marked(data)// 将markdown内容解析
	// console.clear();
	// console.log(data);
	return data;
}

function Test_HasReadme(index) {
	if (this.__navType == 'blog') {
		let meta = this.__Get_Meta(index);
		return Object.keys(meta).length != 0;
	}
	return true;
}

function __Trans_BlogList(data) {
	function CreateNode(path, cache) {//节点创建
		if (path in cache)
			return cache[path];
		let index = path.lastIndexOf('/');
		let name = path.substr(index + 1);
		let upperPath = path.substr(0, index);
		let node = {
			label: name,
			children: [],
		};
		cache[path] = node;
		if (upperPath) {
			if (upperPath in cache == false) {
				CreateNode(upperPath, cache);
			}
			let upperNode = cache[upperPath];
			upperNode.children.push(node);
		}
		return node;
	}
	function SortNode(node) {//对children节点排序，将有子节点的项移到顶部
		node.children.sort((a, b) => (b.children.length != 0) - (a.children.length != 0))
		node.children.forEach((subNode) => SortNode(subNode));
	}

	let cache = {};
	for (let item of data) {
		let path = item['name'];
		let upperPath = path.substr(0, path.lastIndexOf('/'));
		CreateNode(upperPath, cache);
	}

	let root = cache['.'];
	SortNode(root);
	return root.children;
}

function __Trans_Struct(data) {
	let tree = [];
	let stack = [[data, tree]];
	while (stack.length) {
		let item = stack.pop();
		let struct = item[0];
		let lst = item[1];
		for (let name in struct) {
			let node = {
				label: name,
				children: [],
			}
			lst.push(node);
			let subStruct = struct[name];
			if (typeof (subStruct) != '')//目录
				stack.push([subStruct, node.children])
		}
	}
	return tree;
}

function __Trans_RepoList(data) {
	let tree = []
	for (let item in data) {
		tree.push({ label: data[item]['name'] });
	}
	return tree;
}

function __Get_Meta(index) {
	let lst = this.__navList;
	let finder = () => { };
	let trans = {};//只保留关键数据
	switch (this.__navType) {
		case 'github': {
			let name = index[0];
			finder = (item) => {
				return item['name'] == name;
			}
			trans = {
				'name': 'name',
				'html_url': 'url',
				'language': 'language',
				'fork': 'isforked',
				'allow_forking': 'allowforking',
				'forks': 'forks',
				'stargazers_count': 'stars',
				'created_at': 'cTime',
				'updated_at': 'uTime',//不知为何，pushed_at有时是比updated_at还要新，就很莫名其妙
				'pushed_at': 'pTime',
			};
			break;
		}
		case 'blog': {
			let path = ['.', ...index, 'readme.md'];
			path = path.join('/').toLowerCase();
			finder = (item) => {
				return item['name'].toLowerCase() == path;
			}
			trans = {
				'name': 'name',
				'cTime': 'cTime',
				'mTime': 'mTime',
				'struct': 'struct',
			};
			break;
		}
	}

	let data = lst.find(finder);
	let meta = {};
	if (data) {
		for (let key in trans) {
			meta[trans[key]] = data[key];
		}

		switch (this.__navType) {
			case 'github': {//由于pushed_at和updated_at的时间出现新旧不一致的问题，这里单独进行判断mTime
				meta['mTime'] = meta['uTime'] > meta['pTime'] ? meta['uTime'] : meta['pTime'];
				break;
			}
			case 'blog': {//Blog的比较特殊，个别数据需额外处理。按理应该要单独拿到别的函数里头，但拿出去也没法复用，就无所谓了
				//url：将链接导到github.com上
				let url = 'https://github.com/$user/$user.github.io/tree/main/Blog/$path';
				url = url
					.replace('$user', this.__user)
					.replace('$user', this.__user)
					.replace('$path', index.join('/'));
				meta['url'] = url;

				//name：标题去掉头尾的“./”和“/Readme.md”保留中间
				let lst = meta['name'].split('/');
				lst.shift();
				lst.pop();
				meta['name'] = lst.join(' / ');

				//struct：转为ElTree对应数据结构
				meta['struct'] = this.__Trans_Struct(meta['struct']);
				// console.log(meta['struct'])
				break;
			}
		}
	}
	return meta;
}

function __Fail(status, url, fromNavLoad) {
	let fromBlog = this.__navType == 'blog';
	let hint = '$status：'.replace('$status', status);
	switch (status) {
		case 404: {
			hint += '$type资源不存在！ '.replace('$type', fromBlog ? '博客' : 'GitHub仓库');
			if (fromBlog)
				hint += url;
			else
				hint += 'https://github.com/' + url.substr(url.indexOf(this.__user));
			hint += " ";
			break;
		}
		case 0: {
			hint += '网络异常！ \n'
			hint += url;
			hint += " ";
			break;
		}
		default: {

			hint += '其他错误';
		}
	}

	if (fromNavLoad)
		this.data_navLoadTip.value = hint;
	else
		this.data_article.value = hint;
}

function __Get_Promise(p1) {
	let abort = null;
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2])
	p.abort = abort
	return p
}

watch(XJ_Article.data_navIndex, () => {
	XJ_Article.Opt_UpdateArticle(false);
})


XJ_Article.Opt_UpdateNav = Opt_UpdateNav;
XJ_Article.Opt_UpdateArticle = Opt_UpdateArticle;
XJ_Article.Trans_Markdown = Trans_Markdown;
XJ_Article.Test_HasReadme = Test_HasReadme;
XJ_Article.__Trans_RepoList = __Trans_RepoList;
XJ_Article.__Trans_BlogList = __Trans_BlogList;
XJ_Article.__Trans_Struct = __Trans_Struct;
XJ_Article.__Get_Meta = __Get_Meta;
XJ_Article.__Fail = __Fail;
XJ_Article.__Get_Promise = __Get_Promise;
XJ_Article.__promise = XJ_Article.__Get_Promise(new Promise((suc, fai) => { suc(null) }))//创建一个没用的Promise，以简化不必要的if判断


