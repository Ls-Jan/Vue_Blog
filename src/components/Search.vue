

<script setup>
import { ref, watch,onMounted } from 'vue'

// 响应式状态
const keyword = ref("");
const props = defineProps({
    data:{default:[]},
    trans:{default:null}});
const emit = defineEmits(['match'])

//模糊搜索：https://juejin.cn/post/6865223847965097991#heading-2
function Search(lst,queryString) {//返回的是索引值
    let queryStringArr = queryString.split(" ");
    let str = "(.*?)";
    let regStr = str + queryStringArr.join(str) + str;
    let reg = RegExp(regStr, "i"); // 以mh为例生成的正则表达式为/(.*?)m(.*?)h(.*?)/i
    let rst = [];
    let trans=props.trans?props.trans:(val)=>val;
    for(let pst of lst.keys()){
        if (reg.test(trans(lst[pst]))) {
            rst.push(pst);
        }
    };
    return rst;
}

//监听keyword，并将匹配结果发送到match事件
watch(keyword,async (newData, oldData) => {
    if(newData.length==0){
        //实现range：https://segmentfault.com/q/1010000011017807
        emit('match',[...Array(props.data.length).keys()]);
    }
    else{
        let rst=Search(props.data,keyword.value);
        emit('match',rst);
    }
})

</script>



<template>
    <input v-model="keyword">
</template>


<style scoped>

input{
    padding: 0;
    margin-bottom: 5px;
    width:100%;
    text-indent:10px;
    /* left:100px; */
    /* padding:10px; */
    font-size: 20px;
    border-radius: 20px;
}


</style>

