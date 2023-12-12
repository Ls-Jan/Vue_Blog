
<script setup>

import { ref, watch, reactive, nextTick, computed, shallowRef, onMounted } from 'vue'
import { ElRow, ElCol } from 'element-plus';
import { ElMessage } from 'element-plus';
import { ElDivider } from 'element-plus';
import { XJ_Article } from './scripts/XJ_Article'

import NaviBar from './components/NaviBar.vue'
import TreeView from './components/TreeView.vue'
import Article from './components/Article.vue'

import Brief_Home from './components/Brief/Home.vue'
import Brief_Blog from './components/Brief/Blog.vue'
import Brief_Github from './components/Brief/Github.vue'
import Brief_Other from './components/Brief/Other.vue'

const list_menu = [['home', '主页'], ['blog', '博客'], ['github', 'Github仓库'], ['other', '整活'],];
let menu = ref('home');
const props_article = {
  cont_article: ref(XJ_Article.data_article.value),//传入的是html代码
  cont_tag: ref(null),//附在标题后面的Tag
  cont_refresh: ref([]),//与刷新相关的信息，依次是：文章请求时间、XRateLimit的重置时间、XRateLimit当前剩余请求次数
  cont_meta: ref({}),//文章元数据，与XJ_Article.data_meta对应

  showHeader: ref(false),//显示标题栏
  showAddition: ref(false),//显示额外信息

  click_refresh: () => { XJ_Article.Opt_UpdateArticle() },//点击刷新按钮的函数
  click_back: () => { XJ_Article.data_navIndex.value = [] },//点击返回按钮的函数
}

function Click_Menu(index) {
  menu.value = list_menu[index][0];
  props_article.showHeader.value = false;
  props_article.showAddition.value = false;
  switch (menu.value) {//主页
    case 'blog'://博客
    case 'github': {//GitHub仓库
      XJ_Article.Opt_UpdateNav(menu.value == 'github', true);
      break;
    }
    case 'other'://其他
    default: {
      XJ_Article.Opt_UpdateNav(false, false);
      break;
    }
  }
}

watch(XJ_Article.data_navIndex, () => {
  let flag = XJ_Article.data_navIndex.value.length > 0;
  props_article.showHeader.value = flag;
  props_article.showAddition.value = flag;
  document.documentElement.scrollTop = 0;
})

watch(XJ_Article.data_article, () => {
  props_article.cont_article.value = XJ_Article.data_article.value;
  switch (menu.value) {
    case 'github'://GitHub仓库
    case 'blog': {//博客
      let freshLst = [];
      freshLst.push(XJ_Article.stat_UpdateTime.value['article']);
      if (menu.value == 'github') {
        freshLst.push(XJ_Article.stat_XRateLimit.value['reset'])
        freshLst.push(XJ_Article.stat_XRateLimit.value['remaining'])
      }
      // console.log(XJ_Article.data_meta.value.struct);
      // props_article.cont_meta.value = XJ_Article.data_meta.value;
      props_article.cont_refresh.value = freshLst;
      break;
    }
    default: {
      break;
    }
  }
})


//watch是懒监听，对复合数据的深层变化不关心：https://cn.vuejs.org/api/reactivity-core.html#watch
//所以这里额外补了一个value以监听对应的数据变化
watch(XJ_Article.stat_OptResult.value, () => {
  let opt = XJ_Article.stat_OptResult.value
  switch (opt['article']) {
    case -1: {
      ElMessage.error('文章加载失败')
    }
  }
  switch (opt['nav']) {
    case -1: {
      ElMessage.error('导航栏加载失败')
    }
  }
})
</script>




<template>
  <div class="Main">
    <div class="Slogan">
      <el-row>
        <p>
          一片空空~空空一片
        </p>
      </el-row>
    </div>

    <div style="min-width: 60rem;">
      <NaviBar class="NavHead" :data="list_menu.map((item) => item[1])" @click="Click_Menu" index="0"></NaviBar>
      <div style="height:20px;"></div>

      <el-row>
        <div style="width:20px; "></div>
        <el-col :span="5" style="min-width: 10rem;" v-show="XJ_Article.stat_NavShow.value">
          <TreeView class="NavAside"
            @click="(index) => { XJ_Article.Test_HasReadme(index) ? (XJ_Article.data_navIndex.value = index) : null }"
            :empty-text="XJ_Article.data_navLoadTip.value" :is-loading="XJ_Article.stat_OptResult.value['nav'] == 0"
            :data="XJ_Article.data_navList.value">
          </TreeView>
        </el-col>
        <div style="width:20px;"></div>

        <el-col class="Article" :span="XJ_Article.stat_NavShow.value ? 18 : 23">
          <div v-if="XJ_Article.data_navIndex.value.length > 0">
            <!-- 别问为什么不直接用v-bind="props_article"直接绑定，而采取一个一个列出来的费事举动，问就是找不到解决方法 -->
            <Article :cont_article="props_article.cont_article.value" :cont_tag="props_article.cont_tag.value"
              :cont_refresh="props_article.cont_refresh.value" :cont_meta="XJ_Article.data_meta.value"
              :showHeader="props_article.showHeader.value" :showAddition="props_article.showAddition.value"
              :click_refresh="props_article.click_refresh" :click_back="props_article.click_back"
              :is-loading="XJ_Article.stat_OptResult.value['article'] == 0">
            </Article>
          </div>
          <div v-else>
            <Brief_Home v-show="menu == 'home'"></Brief_Home>
            <Brief_Blog v-show="menu == 'blog'"></Brief_Blog>
            <Brief_Github v-show="menu == 'github'"></Brief_Github>
            <Brief_Other v-show="menu == 'other'"></Brief_Other>
          </div>
        </el-col>
      </el-row>
    </div>
    <div style="height: 2rem;"></div>
    <el-divider></el-divider>
    <div style="height: 2rem;"></div>
  </div>
</template>


<style>
.Main {
  --height_NavHead: 5rem;
}

.NavHead {
  position: sticky;
  top: 0;
  left: 0;

  height: var(--height_NavHead);

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  z-index: 1;
}

.NavAside {
  position: sticky;
  top: var(--height_NavHead);
  left: 0;

  padding: 20px 20px 0;
  height: calc(100vh - var(--height_NavHead));
}

.Slogan {
  text-align: center;
  font-size: 2rem;
}
</style>
