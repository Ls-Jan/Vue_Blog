



export var XJ_Storage={//底层用的是localStorage，这玩意儿容量不行，才5MB，很容易就炸。是想过搞大点的，感觉很麻烦(容易出现不兼容问题)就算了：https://juejin.cn/post/7163075131261059086
  Get_EmptySpace:()=>null,//获取剩余空间(字节)
  Get_Data:(key)=>null,//获取数据，返回的是JSON对象
  Set_Data:(key,data,timeout_min=60,force=true)=>{return true;},//设置数据，data为JSON对象。设置成功将返回true。force为真时强制保存(反复移除最旧数据以获取足够空间保存)
  Opt_RemoveData:(key)=>{},//移除数据
  Opt_RemoveOldestData:()=>{},//移除最旧的数据
  Opt_RemoveInvalidData:()=>{},//移除过期的数据
  Opt_RemoveAll:()=>{},//移除所有数据
  Get_TimeoutDate:(second,minute=0,hour=0,day=0)=>null,//返回超时时间对应的Date对象

  
  __Init:()=>{},//数据初始化。脚本载入时自动调用
  __count:5*1024*1024,//localStorage剩余容量
  __record:{},//记录每份数据占用的空间大小以及过期时间刻。[key:[size,timeStamp]]
  __keys:[],//key值从旧到新排列。[key,timeStamp]
};


function Get_TimeoutDate(second,minute=0,hour=0,day=0){//返回超时时间对应的Data对象
  hour+=day*24;
  minute+=hour*60;
  second+=minute*60;

  var d = new Date();
  d.setTime(d.getTime()+(second*1000));
  return d;
}

function Get_Data(key){
  let data=localStorage.getItem(key);
  data=JSON.parse(data);
  if(data){
    var d=new Date();
    if(data[1]-d.getTime()>0)//数据没过期
      return data[0];
    else
      localStorage.removeItem(key);
  }
  return null;
}

function Set_Data(key,data,timeout_min=60,force=true){
  if(key in this.__record)
    this.Opt_RemoveData(key);
  let timeStamp=Get_TimeoutDate(0,timeout_min).getTime();
  let str=JSON.stringify([data,timeStamp])
  let size=key.length+str.length;

  if(force){
    let len=localStorage.length;
    for(;len>0 && this.__count<=size;)
      this.Opt_RemoveOldestData();  
  }
  if(this.__count<=size)
    return false;

  this.__count-=size;
  this.__record[key]=[size,timeStamp];
  this.__keys.push([key,timeStamp]);
  localStorage.setItem(key,str);
  return true;  
}


function Opt_RemoveData(key){
  localStorage.removeItem(key);
  if(key in this.__record){
    this.__count+=this.__record[key][0];
    delete this.__record[key];
  }
}

function Opt_RemoveOldestData(){
  while(true){
    let item=this.__keys.shift();
    let key=item[0];
    let timeStamp=item[1];
    if(this.__record[key][1]==timeStamp){
      this.Opt_RemoveData(key);
      break;
    }
  }
}

function Opt_RemoveInvalidData(){
  let keys=this.__keys;
  keys.sort((A,B)=>A[1]-B[1]);//自小到大排序
  let date=new Date();
  while(keys.length>0){
    let item=keys[0];
    let key=item[0];
    let timeStamp=item[1];
    if(timeStamp>date.getTime())
      break;
    keys.shift();
    if(this.__record[key][1]==timeStamp){
      this.Opt_RemoveData(key);
    }
  }
}

function Opt_RemoveAll(){
  localStorage.clear();
  this.__Init();
}

function Get_EmptySpace(){
  return this.__count;
}

function __Init(){
  let count=5*1024*1024;
  let record={};
  let keys=[];
  for(let i=localStorage.length;--i>=0;){//遍历，并统计数据
    let key=localStorage.key(i);
    let data=localStorage.getItem(key);
    let size=key.length+data.length;
    data=JSON.parse(data)
    count-=size;
    keys.push([key,data[1]]);
    record[key]=[size,data[1]];
  }

  this.__count=count;
  this.__record=record;
  this.__keys=keys;
  this.Opt_RemoveInvalidData();
}



XJ_Storage.Get_EmptySpace=Get_EmptySpace
XJ_Storage.Get_Data=Get_Data
XJ_Storage.Set_Data=Set_Data
XJ_Storage.Opt_RemoveData=Opt_RemoveData
XJ_Storage.Opt_RemoveOldestData=Opt_RemoveOldestData
XJ_Storage.Opt_RemoveInvalidData=Opt_RemoveInvalidData
XJ_Storage.Opt_RemoveAll=Opt_RemoveAll
XJ_Storage.Get_TimeoutDate=Get_TimeoutDate
XJ_Storage.__Init=__Init


XJ_Storage.__Init();


