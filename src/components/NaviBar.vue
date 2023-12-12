

<script setup>

import { ref, watch, nextTick } from 'vue'
import { ElMenu, ElMenuItem } from 'element-plus';
import { ElInput } from 'element-plus';
import { ElScrollbar } from 'element-plus';
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
    data: { default: ['A', 'B', 'C'] },
    index: { default: -1 },
    vertical: { default: false },
    searchable: { default: false }
});
const emit = defineEmits(['click']);
//附赠一个没用的插槽，用于props.data为空时显示信息，例如Loading...








// [...Array(10).keys()]//实现range：https://segmentfault.com/q/1010000011017807

let currIndex = -1;//用于避免重复点击
const visible = ref(true)//用于列表更新时重置当前索引值
const keyword = ref('')
const matchLst = ref([])//搜索的匹配结果，用于设置样式表的display:none(以此隐藏不匹配的项)

function ClickItem(newIndex) {
    if (currIndex != newIndex) {//避免重复点击
        currIndex = newIndex;
        emit('click', newIndex);
    }
}

//模糊搜索：https://juejin.cn/post/6865223847965097991#heading-2
function SearchItem(lst, queryString) {//返回的是bool值列表(索引派不上用场)
    let queryStringArr = queryString.split(" ");
    let str = "(.*?)";
    let regStr = str + queryStringArr.join(str) + str;
    let reg = RegExp(regStr, "i"); // 以mh为例生成的正则表达式为/(.*?)m(.*?)h(.*?)/i
    let rst = [];
    let trans = props.trans ? props.trans : (val) => val;
    for (let pst of lst.keys()) {
        rst.push(reg.test(trans(lst[pst])));
    };
    return rst;
}

function Update() {
    if (currIndex != props.index) {
        currIndex = props.index;
        visible.value = false;//以此重置列表当前索引值
        nextTick(() => { visible.value = true });
    }
    matchLst.value = SearchItem(props.data, keyword.value);
}

watch(props, () => {
    Update();
})

Update();//同时也作为关键数据初始化的手段

</script>



<template>
    <div>
        <el-input v-show="props.searchable" :prefix-icon="Search" v-model="keyword"
            @input="matchLst = SearchItem(props.data, keyword)" clearable />
        <el-scrollbar height="90%" style="background-color: #222222">
            <!-- ElMenu去除多余：https://blog.csdn.net/weixin_45974259/article/details/124040586 -->
            <el-menu :mode="props.vertical ? 'vertical' : 'horizontal'" :default-active="props.index.toString()"
                style="border:0;" v-show="visible">
                <slot v-if="props.data.length == 0">Loading...</slot>
                <template v-for="match, index in matchLst">
                    <el-menu-item :label="props.data[index]" :index="index.toString()" :style="match ? '' : 'display:none'"
                        @click="ClickItem(index)">
                        <div style="overflow:hidden; text-overflow:ellipsis;  user-select:none; font-size:1.2rem">
                            {{ props.data[index] }}
                        </div>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-scrollbar>
    </div>
</template>
