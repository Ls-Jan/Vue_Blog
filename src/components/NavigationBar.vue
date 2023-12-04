

<script setup>
// 导航栏：https://www.runoob.com/css/css-navbar.html
import "../assets/NavigationBar_Horizontal.css";
import "../assets/NavigationBar_Vertical.css";

import { ref, onMounted, reactive, watch } from 'vue'
import Search from './Search.vue'


const props = defineProps({
    data:{default:['A','B','C']},
    trans:{default:null},
    index:{default:0},
    loadingTip:{default:'Loading...'},
    vertical:{default:false},
    searchable:{default:false}});
const emit = defineEmits(['click']);

//实现range：https://segmentfault.com/q/1010000011017807
const indexLst=ref([...Array(props.data.length).keys()]);

function itemClick(index){
    if(props.index!=index)//避免重复点击
        emit('click',index);
}

watch(props,()=>{
    indexLst.value=[...Array(props.data.length).keys()];
})

</script>





<template>
    <div>
        <Search id="search" v-if="props.searchable" :data="props.data" :trans="props.trans" @match="(lst)=>indexLst=lst" placeholder="搜索"/>

        <ul :class="{Vertical:props.vertical,Horizontal:!props.vertical}">
            <li v-if="!props.data.length">
                {{props.loadingTip}}
            </li>
            <li v-for="index in indexLst">
            <!-- <li v-for="index in indexLst"> -->
                <!-- a标签的点击事件：https://blog.csdn.net/shiyong1949/article/details/73223619 -->
                <!-- <a href="javascript:void(0)" @click="itemClick(index)" :class="{active:index==props.index}">{{index}}</a> -->
                <a href="javascript:void(0)" @click="itemClick(index)" :class="{active:index==props.index}">{{ props.trans?props.trans(props.data[index]):props.data[index] }}</a>
                <!-- <a href="javascript:void(0)" @click="itemClick(index)" :class="{active:index==props.index}">{{ String(props.data[index]) }}</a> -->
                <!-- <a href="javascript:void(0)" @click="emit('click',index)" :class="{active:index==props.index}">{{ props.data[index] }}</a> -->
            </li>
        </ul>
    </div>
</template>


<style scoped>

div{
    width:100%;
    background-color: #222222;
}

</style>



