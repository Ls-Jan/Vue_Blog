
<script setup>
import { ref, onMounted } from 'vue'
import Article from './components/Article.vue'
import NavigationBar from './components/NavigationBar.vue'

import {XJ_Storage} from './scripts/XJ_Storage'
import {XJ_Github} from './scripts/XJ_Github'


const data_article=ref('``12345AACC12345AACC12345AAC5AACC12345AACC12345AACC12345AACC12345AACC``');
const list_menu=ref(['主页','博客','Github仓库','整活'])
const list_article=ref([])

const index_menu=ref(0);
const index_article=ref(0);

function Click_Menu(index){
  index_menu.value=index;
  if(index==2){//GitHub仓库    
    XJ_Github.Get_Repos('ls-jan')
        .then((data)=>{
            data=XJ_Github.Trans_Repos(data);
            // list_article.value=[1,2,3];
            list_article.value=data;
            
            // console.log(list_article.value);
            console.log(data);
            // console.log(XJ_Github.Get_Ratelimit());    
            // console.log(XJ_Github.Get_RequestTime());    
        })
        .catch((status,data)=>{
            console.log(status,data);
        });
  }
  else{
    list_article.value=[];
  }
}

function Click_Article(index){
  XJ_Github.Get_Readme('ls-jan',list_article.value[index]['name'])
        .then((data)=>{
            data=XJ_Github.Trans_Readme(data);
            // console.log(data);
            console.log(XJ_Github.Get_Ratelimit());
            console.log(XJ_Github.Get_RequestTime());
            data_article.value=data;
            index_article.value=index;
            // list_article.value=[1,2,3];
            // list_article.value=data;            
        })
        .catch((status,data)=>{
            console.log(status,data);
        });
  // data_article
}

</script>

<template>
  <!-- <div style="width:100%"></div> -->
  <!-- <div style="width:100%"> -->
  <div>
    <div class="header">
      <p>XJ的个人主页</p>
    </div>

    <!-- <textarea v-model="data"></textarea> -->
    <div>
      <NavigationBar id="navi_menu" :data="list_menu" :index="index_menu" @click="Click_Menu"></NavigationBar>
    </div>
    <div class="body">
      
      <NavigationBar id="navi_article" :data="list_article" :index="index_article" :trans="(data)=>data['name']" @click="Click_Article" vertical="true" searchable="true"></NavigationBar>
      <Article id="article" :data="data_article" style="font-size: 25px;"></Article>
    </div>

    <div class="footer">

    </div>
  </div>


</template>


<style scoped>

.header {
  background: linear-gradient(#444444,#222222);
  /* background-color: #2f5597; */
  text-align: center;
  font-size: 30px;
  padding: 50px;
}


/* #navi_menu{
  background-color:transparent;

} */

#navi_article{
  background-color: #222222;
  float: left;
  width: 20%;
  padding: 1%;
  /* padding: 10px; */

}

#article{
  background-color: rgb(60, 61, 61);
  float: left;
  width: 75%;
  padding: 1%;
}

</style>
