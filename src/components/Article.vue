




<script setup>

import {Trans_Markdown} from './scripts_vue/Trans_Markdown'
import {ref, watch} from 'vue'
import { debounce } from 'lodash-es'//防抖

const props = defineProps({
    data:{default:''}});
const cont=ref('');

const Update=debounce((e) => {
  cont.value=Trans_Markdown(props.data);
}, 100)


watch(props,()=>{
    Update();
})
Update();

</script>



<template>
  <div class="article" v-html="cont"></div>
</template>


<style scoped>
/* div换行：https://blog.csdn.net/GraySakura/article/details/104821218 */
div{
  white-space:normal;
   word-break:break-all;
   overflow:hidden;
}

</style>

