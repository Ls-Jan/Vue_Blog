function getOrderStatus(orderId) {
    return new Promise((resolve, reject) => {
        // 模拟从供应商API获取订单状态
        console.log(resolve,reject)
        setTimeout(() => {
        // 假设成功获取到了订单状态
        // resolve('Shipped');
        reject('???')
        }, 1);
    });
}

let os=getOrderStatus('12345');
setTimeout(()=>{
    console.log('...')
    os.then(status => {
        // 此处可以整合其他供应商的信息
        console.log(`Order status: ${status}`); // 输出: Order status: Shipped
    })
    .catch(error => {
        // 如果有任何错误，此处可以处理
        console.error(error);
    });
},1000)


export var num=3;
    


