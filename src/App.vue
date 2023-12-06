
<script setup>

import { ref, watch , reactive } from 'vue'
import NaviBar from './components/NaviBar.vue'

// const list_menu=ref([])
const list_menu=ref(['主页','博客','Github仓库','整活'])
// const data=ref(['A','AB','ABC']);

</script>



<template>

    <NaviBar :data="list_menu" @click="(index)=>console.log(index)">
        加载中...
    </NaviBar>
</template>



