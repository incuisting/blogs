### 基本概念

在讲 event loop 之前有几个概念需要说一下

- **stack(栈)**：特点是先进后出
- **queue(队列)**：特点是先进先出。  
  还有一个需要明确一下那就是 JavaScript 是`单线程`的。这就意味着，任务必须一个接着一个的执行，前一个没有完成后一个必须等着。以下列代码的运行为例子

```javascript
function multiply(a, b) {
  return a * b
}
function square(n) {
  return multiply(n, n)
}
function printSquare(n) {
  let squared = square(n)
  console.log(squared)
}
printSquare(4)
```

它的执行顺序为`multiply`=>`square`=>`printSquare`=>`console.log`  
emmm...具体流程如下面动图
![执行顺序](https://user-gold-cdn.xitu.io/2018/5/24/1639256d7afd7155?w=1249&h=689&f=gif&s=5352654)  
这个图很好的诠释了，stack 的先进后出和 JavaScript 的单线程。  
这里就不再解释为什么 JavaScript 是单线程的了，感兴趣的话可以自己搜索一下。接下去我们主要讲讲单线程会带来什么问题，从上面这个动图的执行上来看，好想都挺正常的没毛病。  
但是不要忘记了，浏览器是会去请求数据的。那么当我们全部去同步请求数据的时候，对单线程来说就是噩梦就像下面这样

![阻塞](https://user-gold-cdn.xitu.io/2018/5/24/163927127503b383?w=1249&h=689&f=gif&s=12019702)  
所有的一切都被同步的请求阻塞住，假如这个请求 10 分钟不回来，那么整个程序讲被卡住 10 分钟。所以 JavaScript 将任务分为同步任务（synchronous）和异步任务（asynchronous）。  
异步任务执行的过程如下图（setTimeout 在 JavaScript 为异步任务）

![异步](https://user-gold-cdn.xitu.io/2018/5/24/1639278fef8d84c1?w=1249&h=689&f=gif&s=4367650)  
可以看到整个线程没有被阻塞住，但是打印的顺序并不是我们预想的`hi`=>`there`=>`JSConfEU`。而是`hi`=>`JSConfEU`=>`there`。从 stack 的调用来看，`console.log('there')`被放到了最后`mian()`退出之后才执行。这个里面到底怎么回事，那就要引入今天主体事件环（event loop）才可以解释了。  
 \*\*\*\*  
 ### Event Loop  
 为了更好的理解，先看这张图（引自 Philip Roberts 的演讲[What the heck is the event loop anyway? ](https://www.youtube.com/watch?v=8aGhZQkoFbQ)）  
 ![eventloop](https://user-gold-cdn.xitu.io/2018/5/26/1639b4e061a9c721?w=601&h=527&f=png&s=22933)  
 > 主线程运行的时候，产生堆（heap）和栈（stack），栈中的代码调用各种外部 API，它们在"任务队列"中加入各种事件（click，load，done）。只要栈中的代码执行完毕，主线程就会去读取"任务队列"，依次执行那些事件所对应的回调函数。

还是这个例子：
![事件环](https://user-gold-cdn.xitu.io/2018/5/25/16397468c6992e7b?w=1249&h=689&f=gif&s=8164343)
可以发现`异步任务`的回调函数会在，所有的`同步任务`执行完毕后以先进先出的顺序，从`任务队列（task queue）`里拿出来放到执行栈中执行。所以异步任务的回调谁先执行只和哪个异步任务的回调函数先被推入`任务队列（task queue）`有关。
#### 宏任务和微任务
那么如下代码应该如什么顺序？
```JavaScript
   setTimeout(function(){
       console.log(1)
   },0);
   new Promise(function(resolve){
       console.log(2)
       for( var i=5 ; i>0 ; i--  ){
               i==1 && resolve()
       }
       console.log(3)
       }).then(function(){
         console.log(4)
       });
         console.log(5);
```
按照上面说的事件环里的原理，应该是这样的：
1. 先执行setTimeout把console.log(1)放到任务队列（task queue）的最后面
2. 遇到一个Promise，先console.log(2)
3. 等到循环结束，把console.log(4)推到任务队列（task queue）的最后
4. console.log(3)
5. 执行同步任务cosole.log(5)
6. 从任务队列（task queue）里拿出console.log(1)执行再拿出console.log(4)执行

结果应该是：`2，3，5，1，4`
把代码贴到chrome里跑一下看看

![chrome](https://user-gold-cdn.xitu.io/2018/5/26/1639cbefcfd3843a?w=653&h=555&f=png&s=35286)
好像和预期的不太一样。。。。。。。为什么原本应该在setTimeout回调后面的Promise的回调反而跑到前面去执行了呢？
然后找到了一篇[关于microtask和macrotask的长文](https://www.zhihu.com/question/36972010)一口气看完彻底明白。
总结起来就是：
首先JS会将异步任务分为两个类别`macrotask`和`microtask`
两个类别的具体分类如下：
- **macro-task**: `script（整体代码）`, `setTimeout`, `setInterval`, `setImmediate`, `I/O`, `UI rendering`
- **micro-task**: `process.nextTick`, `Promises`（这里指浏览器实现的原生 Promise）, `Object.observe`, `MutationObserver`

JS引擎处理着两种任务的顺序是：
首先在`宏任务（macrotask）`的队列（这个队列也被叫做`task queue`）中取出第一个任务，执行完毕后取出`微任务（microtask）` 队列中的所有任务顺序执行；之后再取`宏任务（macrotask）` 任务，周而复始，直至两个队列的任务都取完。

**那么回到我们的代码**
1-5的流程还是和原来的一样，重点是在第六步开始。由于整体的`script`算是一个`宏任务（macrotask）`所以在它执行完毕之后势必是要先把`微任务（microtask）`队列里所有任务按顺序执行，也就是`console.log(4)`,然后再执行下一个`宏任务（macrotask）`也就是`console.log(1)`
**以上所有流程的大前提是在浏览器环境下**
