




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

export function Trans_Markdown(data){
    return marked(data);// 将markdown内容解析
}













