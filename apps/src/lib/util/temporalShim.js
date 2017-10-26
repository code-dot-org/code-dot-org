/** @file Browser-friendly shim for 'temporal' module.
 * The 'temporal' library is used by johnny-five for super-detailed scheduling
 * when working with robotics.
 * https://github.com/rwaldron/temporal
 * Unfortunately it's also a CPU hog, and gets used for things that don't need
 * it, like some LED animations.
 * This shim implements the same interface but uses simple setInterval calls
 * to schedule work.  We swap it in for the real temporal library in our build
 * using Webpack. */

import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser


class TemporalShim extends EventEmitter {
  // Only queue() and loop() actually get used by johnny-five.

  queue(tasks) {
    let refs = [];
    let cumulativeDelay = 0;
    tasks.forEach(({delay, loop, task}) => {
      if (loop !== undefined) {
        refs.push(this.delay(cumulativeDelay, () => {
          refs.push(this.loop(loop, task));
        }));
      } else {
        cumulativeDelay += delay;
        refs.push(this.delay(cumulativeDelay, task));
      }
    });

    return {
      stop: () => {
        refs.forEach(ref => ref.stop());
      }
    };
  }

  loop(time, operation) {
    if (typeof time === 'function') {
      operation = time;
      time = 10;
    }

    const interval = setInterval(() => {
      operation({calledAt: Date.now()});
    }, time);

    return {
      stop: () => clearInterval(interval)
    };
  }

  delay(time, operation) {
    if (typeof time === 'function') {
      operation = time;
      time = 10;
    }

    const timeout = setTimeout(() => {
      operation({calledAt: Date.now()});
    }, time);

    return {
      stop: () => clearTimeout(timeout)
    };
  }
}

const singleton = new TemporalShim();
export default singleton;
