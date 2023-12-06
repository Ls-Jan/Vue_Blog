

<script setup>

import { ref, watch , nextTick } from 'vue'
import { ElMenu,ElMenuItem } from 'element-plus';
import { ElInput } from 'element-plus';

const props = defineProps({
    data:{default:['A','B','C']},
    index:{default:-1},
    vertical:{default:false},
    searchable:{default:false}});
const emit = defineEmits(['click']);
//组件还附赠一个插槽，用于props.data为空时显示加载提示信息，例如Loading...








// [...Array(10).keys()]//实现range：https://segmentfault.com/q/1010000011017807

let index=-1;//用于避免重复点击
const visible=ref(true)//用于列表更新时重置当前索引值
const keyword=ref('')
const matchLst=ref([])//搜索的匹配结果，用于设置样式表的display:none(以此隐藏不匹配的项)

function ClickItem(newIndex){
    if(index!=newIndex){//避免重复点击
        index=newIndex;
        emit('click',newIndex);
    }
}

//模糊搜索：https://juejin.cn/post/6865223847965097991#heading-2
function Search(lst,queryString) {//返回的是bool值列表(索引派不上用场)
    let queryStringArr = queryString.split(" ");
    let str = "(.*?)";
    let regStr = str + queryStringArr.join(str) + str;
    let reg = RegExp(regStr, "i"); // 以mh为例生成的正则表达式为/(.*?)m(.*?)h(.*?)/i
    let rst = [];
    let trans=props.trans?props.trans:(val)=>val;
    for(let pst of lst.keys()){
        rst.push(reg.test(trans(lst[pst])));
        // if (reg.test(trans(lst[pst]))) 
        //     rst.push(pst);
    };
    return rst;
}

function Update(){
    visible.value=false;//以此重置列表当前索引值
    nextTick(()=>{visible.value=true});
    matchLst.value=Search(props.data,keyword.value);
}

watch(props,()=>{
    Update();
})

Update();//同时也作为关键数据初始化的手段

</script>







<template>
    <el-menu :mode="props.vertical?'vertical':'horizontal'" :default-active="props.index.toString()" v-if="visible">
        <ElInput v-if="props.searchable" v-model="keyword" @input="matchLst=Search(props.data,keyword)" clearable/>
        <slot v-if="props.data.length==0">Loading...</slot>
        <template v-for="match,index in matchLst">
            <el-menu-item 
                :label="props.data[index]" 
                :index="index.toString()" 
                :style="match?'':'display:none'" 
                @click="ClickItem(index)" >
                        {{ props.data[index] }}
            </el-menu-item>
        </template>
    </el-menu>
</template>
