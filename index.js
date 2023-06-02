


const PENDING = 'PENDING';
const REJECTED = 'REJECTED';
const FULFILLED = 'FULFILLED';


function resolvePromise(promise2, x, resolve, reject) {

  if (promise2 === x) {
    reject("返回值不能是当前promise");
    return;
  }

  if (x === promise2) {
    reject('错误')
  }
  if (x instanceof MyPromise) {
    // 如果是promise则返回promise的
    x.then((value) => {
      resolve(value)
    }, (reason) => {
      reject(reason)
    })
  } else {
    resolve(x)
  }


}


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
    console.log(e)
    reject(e)
  }
}

// 具有一个then方法具有两个参数onFulfilled, onRejected
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  let promise2 = new MyPromise((resolve, reject) => {
    // 成功的回调
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFulfilled(this.value) // then回调onFulfilled的返回值
          // resolve(x)
          // 再次处理返回值
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    }
    // 失败的回调
    if (this.status === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(this.value)
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })

    }
    // 收集then的回调
    if (this.status === PENDING) {
      // 保留参数
      this.resolveCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      })
      this.rejectCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  })

  return promise2


}

const fnObj = {
  resolve: function (res) {
    return new MyPromise((resolve) => {
      // 如果是promise
      if (res instanceof MyPromise) {
        res.then((r) => resolve(r))
      } else {
        resolve(res)
      }
    })
  },
  reject: function (reason) {
    return new MyPromise((resolve, reject) => {
      // 如果是promise
      if (reason instanceof MyPromise) {
        reject.then((r) => resolve(r))
      } else {

        reject(reason)
      }
    })
  },
  all: function ([...argues]) {
    try {
      let result = []
      argues.forEach(item => {
        if (item instanceof MyPromise) {
          item.then(res => {
            result.push(res)
          }, reject => {
            reject('错误')
          })
        } else {
          result.push(item)
        }
      })
      return new MyPromise(resolve => {
        resolve(result)
      })
    } catch (e) {
      console.log(e)
    }
  },
  race: function () {
    
  }
}
Array.from(['resolve', 'reject', 'all', 'race']).forEach(method => {
  MyPromise[method] = fnObj[method]

})
