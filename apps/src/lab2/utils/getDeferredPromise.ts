/*
  a deferred promise is a promise which can be resolved at any time to hand arguments into a function.
  e.g.,

  async function f(deferred) {
    return new Promise( (resolve, reject) => {
      const args = await deferred
      console.log("invoked with args: ", args)
      // do interesting things with args
    })
  }

  const { deferred, resolve, reject } = getDeferredPromise()
  const pendingPromise = f(deferred)
  // you now have a pendingPromise. This can be handed into anything expecting a promise, even if you don't know
  // the arguments you want to call it with yet.
  At some point later, you can call:
  resolve(["A","B", "C"])
  and ["A", "B", "C"] will be handed into that pendingPromise and you can do what you want with it, then resolve at your leisure.
}
*/

type PromiseFunction = ((value?: unknown) => void) | null;

export type DeferredPromiseObject = {
  deferred: Promise<unknown>;
  resolve: PromiseFunction;
  reject: PromiseFunction;
};

export function getDeferredPromise(): DeferredPromiseObject {
  let resolve: PromiseFunction = null;
  let reject: PromiseFunction = null;
  const deferred = new Promise((inner_resolve, inner_reject) => {
    resolve = inner_resolve;
    reject = inner_reject;
  });

  return {deferred, resolve, reject};
}
