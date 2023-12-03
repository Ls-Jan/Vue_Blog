

<script setup>

import {ref} from 'vue'

const lst= ref([111111111,2,3,4,5])


</script>




<template>

    <div id="outer">
        <box id="center">
            <ul>
                <li v-for="item of lst">
                    <a class="Test" href="javascript:void(0)" @click="console.log(item)">{{ item }}</a>
                </li>
            </ul>
            
        </box>
    </div>

</template>


<style>

#outer{
    display         : flex;
    justify-content : center;
    align-items     : center;

    /* display: flex; */
    /* width:800px; */
    border: 2px solid rebeccapurple;
    padding: .5em;
    /* align-items: center; */
    /* justify-content: space-around; */
}

#center{
    /* width:100%; */
    /* width:1000px; */
    width:fit-content;
    /* margin: 0 600px; */
    /* margin: 0 auto; */
    background-color: blueviolet;

    /* display: flex;
    align-items: center;
    justify-content: space-around; */


    /* position  : absolute; */
    /* top       : 50%; */
    /* left      : 50%; */
    /* transform : translate(-50%,-50%); */
}

.Test{
  float: left;
  width: auto;
  padding: 15px;
  background-color: #00FFFF;
}

</style>
