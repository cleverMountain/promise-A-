


const PENDING = 'PENDING';
const REJECTED = 'REJECTED';
const FULFILLED = 'FULFILLED';



function MyPromise(excutor) {
  this.status = PENDING;
  this.value = undefined
  this.reason = undefined
  this.resolveCallbacks = []; // 收集回调异步执行
  this.rejectCallbacks = [];
  let resolve = (value) => {

    // 只能由pengding状态改为
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = value
      this.resolveCallbacks.forEach(cb => cb())
    }

  }
  let reject = (value) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reason = value
      this.rejectCallbacks.forEach(cb => cb())
    }
  }
  try {
    // 执行excutor
    excutor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}
// 具有一个then方法具有两个参数onFulfilled, onRejected
MyPromise.prototype.then = function (onFulfilled, onRejected) {

  // 成功的回调
  if (this.status === FULFILLED) {
    onFulfilled(this.value)
  }
  // 失败的回调
  if (this.status === REJECTED) {
    onRejected(this.value)
  }
  // 收集then的回调
  if (this.status === PENDING) {
    // 保留参数
    this.resolveCallbacks.push(() => {
      onFulfilled(this.value)
    })
    this.rejectCallbacks.push(() => {
      onRejected(this.reason)
    })
  }


}