const PENDING = 'PENDING';
const REJECTED = 'REJECTED';
const FULFILLED = 'FULFILLED';

function resolvePromise(promise2, x, resolve, reject) {
  debugger
    if (promise2 === x) {
        reject("返回值不能是当前promise");
        return;
    }
    let called;
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(
                    x,
                    y => {
                        if (called) return;
                        called = true;
                        resolvePromise(promise2, y, resolve, reject);
                    }, r => {
                        if (called) return;
                        called = true;
                        reject(r);
                    })
            } else {
                if (called) return;
                called = true;
                resolve(e);
            }
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

function isPromise(promise) {
    if ((typeof promise === 'object' && promise !== null) || typeof promise === 'function') {
        try {
            let then = promise.then;
            if (typeof then === 'function') return true
            else return false;
        } catch {
            return false;
        }
    } else
        return false;
}

class Promise {
    constructor(excutor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.resolveCallbacks = [];
        this.rejectCallbacks = [];

        let resolve = ((value) => {
         
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.resolveCallbacks.forEach(fn => fn());
            }
        }).bind(this);
        let reject = (function(reason) {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.rejectCallbacks.forEach(fn => fn());
            }
        }).bind(this);
        try {
            excutor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }

    then(onfulfilled, onrejected) {
        onfulfilled = typeof onfulfilled === 'function' ?
            onfulfilled : value => value;
        onrejected = typeof onrejected === 'function' ?
            onrejected : reason => { throw reason };
console.log(this.status)

        let promise2 = new Promise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onfulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onrejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            if (this.status === PENDING) {
                this.resolveCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onfulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    })
                });
            }
            if (this.status === PENDING) {
                this.rejectCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onrejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    })
                });
            }
        })

        return promise2;
    }

    catch (callback) {
        return this.then(null, callback);
    };

    finally(callback) {
        return this.then((data) => {
            // callback();
            // return data;
            return Promise.resolve(callback()).then(() => data); //callback是个promise让promise执行完在返回
        }, (err) => {
            // callback();
            // throw err;
            return Promise.resolve(callback()).then(() => { throw err }); //callback是个promise让promise执行完在返回
        })
    };

    static resolve(value) {
        return new Promise((resolve, reject) => {
            resolve(value);
        })
    }
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }
    static all(promises) {
        return new Promise((resolve, reject) => {
            let r = [];
            let index = 0;
            let processData = (index, value) => {
                r.push(value);
                if (++index === promises.length)
                    resolve(r);
            }
            let processValue = (index, value) => {
                if (isPromise(value)) {
                    value.then((data) => {
                        processValue(index, data);
                    }, reject)
                } else {
                    processData(index, value);
                }
            }
            for (let i = 0; i < promises.length; i++) {
                let value = promises[i];
                processValue(i, value);
            };
        });
    }
    static race(promises) {
        return new Promise((resolve, reject) => {
            let processValue = (value) => {
                if (isPromise(value)) {
                    value.then((data) => {
                        processValue(data);
                    }, reject)
                } else {
                    resolve(value);
                }
            }
            for (let i = 0; i < promises.length; i++) {
                let value = promises[i];
                processValue(value);
            };
        });
    }
    static defer() {
        let result = {};
        result.promise = new Promise((resolve, reject) => {
            result.resolve = resolve;
            result.reject = reject;
        });
        return result;
    }
}

