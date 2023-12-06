
<script setup>
import { ref, onMounted,watch } from 'vue'

import {XJ_Article} from './scripts/XJ_Article'


const test=ref('')

watch(XJ_Article.stat_OptResult,()=>{
  // console.log(XJ_Article.stat_OptResult.value);
  if(XJ_Article.stat_OptResult.value==1){
    // XJ_Article.data_navIndex.value=0;
    XJ_Article.data_navIndex.value=3;
    // console.log(XJ_Article.data_navList.value);
  }
  if(XJ_Article.stat_OptResult.value!=0){
    // console.log(XJ_Article.data_navList.value[0]);
    // console.log(XJ_Article.data_navList.value);
    // console.log(XJ_Article.data_article.value);
    console.log(XJ_Article.data_meta.value);
    test.value=XJ_Article.data_article.value;
    console.log();
  }
})
//https://github.com/Ls-Jan/Ls-Jan.github.io/tree/main/Blog/自定义CMD命令/

// XJ_Article.Opt_UpdateNav(false,true);
XJ_Article.Opt_UpdateNav(true);

const val=ref('<button>Test</button>')

// fetch('https://ls-jan.github.io/Blog/%E8%87%AA%E5%AE%9A%E4%B9%89CMD%E5%91%BD%E4%BB%A4/')
//   .then((resp)=>{
//     resp.text().then((data)=>{
//       console.log(data);
//       val.value=data;
//     })
//   })


</script>



<template>
  <div v-html="test"></div>
  <!-- <iframe :srcdoc="val"></iframe> -->
  <!-- <div v-html="val"></div> -->
</template>
