
import { createApp } from 'vue'
import App from './App.vue'
// import Test2 from './Test2.vue'
import Test from './Test.vue'
import Article from './components/Article.vue'

// import {num} from './scripts/Test';

// createApp(Article).mount('#app')
// createApp(Test).mount('#app')
// createApp(Test2).mount('#app')
createApp(App).mount('#app')




import {XJ_Storage} from './scripts/XJ_Storage'
import {XJ_Github} from './scripts/XJ_Github'


// let lst=[[1,300],[2,200],[3,100]]
// XJ_Storage.Set_Data('lst',lst,0.01);
// let data=XJ_Storage.Get_Data('lst');
// let size=XJ_Storage.Get_EmptySpace();
// console.log(data);
// console.log(XJ_Storage.Get_EmptySpace());
// console.log(XJ_Storage.Set_Data('val',[123]))
// console.log(XJ_Storage.Get_Data('val'))

// XJ_Storage.Opt_RemoveAll();

// XJ_Github.Get_Repos('ls-jan')
//     .then((data)=>{
//         data=XJ_Github.Trans_Repos(data);
//         console.log(data);
//         console.log(XJ_Github.Get_Ratelimit());    
//         let date=XJ_Github.Get_RequestTime();
//         // console.log(typeof(date));    

//         console.log(XJ_Github.Get_RequestTime());
//     })
//     .catch((status,data)=>{
//         console.log(status,data);
//     });

// XJ_Github.Get_Readme('ls-jan','Python_RelativeImport')
// // XJ_Github.Get_Readme('ls-jan','PyQt_Mask')
//     .then((data)=>{
//         data=XJ_Github.Trans_Readme(data);
//         console.log(data);
//         console.log(XJ_Github.Get_Ratelimit());
//     })
//     .catch((status,data)=>{
//         console.log(status,data);
//     });

// XJ_Github.Get_Readme('ls-jan','PyQt_Mask',Success_Readme,(status,data)=>{console.log(status,data);});
// console.log(XJ_Github.Get_Ratelimit());


// for(let i=localStorage.length;i>=0;--i){
//     let key=localStorage.key(i);
//     console.log(key);
//     console.log(XJ_Storage.Get_Data(key))
// }
