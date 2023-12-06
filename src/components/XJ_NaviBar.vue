

<script setup>
// 导航栏：https://www.runoob.com/css/css-navbar.html
import "../assets/NavigationBar_Horizontal.css";
import "../assets/NavigationBar_Vertical.css";

import { ref, watch , reactive } from 'vue'
// import Search from './Search.vue'


const style_item={//样式表与组件绑定
    fontSize:'53px',
}

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
    <div :style="style_item">
        Test
    </div>
    <div>
        <!-- <Search id="search" v-if="props.searchable" :data="props.data" :trans="props.trans" @match="(lst)=>indexLst=lst" placeholder="搜索"/> -->
        <div class="Navi">
            <template v-for="index in indexLst">
                
                <!-- <div class="NaviItem" href="javascript:void(0)" @click="console.log(index)" :class="{active:index==props.index}">{{ props.trans?props.trans(props.data[index]):props.data[index] }}</div> -->
            </template>
        </div>
    </div>
</template>


<style>
div.Navi{
    display: flex;
    flex-direction: row;
}

div.NaviItem{
    user-select:none;
    display: block;
    width: 50px;
    font-size: 50px;
    background-color: #222222;
}


div.NaviItem:hover{
    background-color: #111111;

}

div.NaviItem:active{
    background-color: #ff4d4d;

}

</style>



