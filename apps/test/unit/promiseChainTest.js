import sinon from 'sinon';
import {expect} from '../util/configuredChai';

// This set of tests describes a number of problem scenarios we encountered
// while setting up the test for celebrateSuccessfulConnection().  It turns
// out Promise chains and sinon fake timers don't always play nice together,
// and you have to jump through some hoops to test them properly without
// waiting for real timers.
describe(`Testing promise chains`, () => {
  let clock, yieldToPromiseChain, sequence;

  beforeEach(() => {
    // Promise chains and fake timers don't work together so well, so we
    // give ourselves a real `setTimeout(cb, 0)` function that will let any
    // promise chains run as far as they can before entering the callback.
    const realSetTimeout = window.setTimeout;
    yieldToPromiseChain = cb => realSetTimeout(cb, 0);

    // Now use fake timers so we can test exactly when the different commands
    // are sent to the board
    clock = sinon.useFakeTimers();

    sequence = [];
  });

  afterEach(() => {
    clock.restore();
  });

  it(`sinon.useFakeTimers normally lets you treat async events as synchronous in tests`, () => {
    setTimeout(() => sequence.push('B'), 0);
    sequence.push('A');
    clock.tick(0); // Calls the scheduled timeout _immediately_
    sequence.push('C');
    expect(sequence).to.deep.equal(['A', 'B', 'C']);
  });

  it(`and when creating new Promises this doesn't seem like an issue`, () => {
    // because a new promise's callback gets called immediately
    const _ = new Promise(resolve => {
      sequence.push('A'); // Invoked immediately
      setTimeout(() => {
        sequence.push('C');
        resolve();
      }, 0);
    });
    sequence.push('B');
    clock.tick(0); // Calls the scheduled timeout _immediately_
    sequence.push('D');
    expect(sequence).to.deep.equal(['A', 'B', 'C', 'D']);
  });

  it(`but Promise.then doesn't happen immediately, even after Promise.resolve()`, done => {
    Promise.resolve()
        .then(() => {
          sequence.push('C');
          expect(sequence).to.deep.equal(['A', 'B', 'C']);
          done();
        });
    sequence.push('A');
    clock.tick(0); // Does _not_ cause Promise.then to occur
    sequence.push('B');
  });

  it(`which can lead to some unexpected results.`, done => {
    Promise.resolve().then(() => {
      sequence.push('C');
      setTimeout(() => {
        sequence.push('E');
        done();
      }, 0);
      sequence.push('D');
      clock.tick(0); // So we have to tick again inside the promise...
      expect(sequence).to.deep.equal(['A', 'B', 'C', 'D', 'E']);
    });
    sequence.push('A');
    clock.tick(0); // Does nothing because tick has not been scheduled!
    sequence.push('B');
  });

  it(`Promise "then" calls seem to be queued in the order they are received`, done => {
    Promise.resolve().then(() => {
      sequence.push('B');
    });
    sequence.push('A');
    Promise.resolve().then(() => {
      sequence.push('C');
      expect(sequence).to.deep.equal(['A', 'B', 'C']);
      done();
    });
  });

  it(`But in complex situations this gets very hard to reason about`, done => {
    const promiseChainBeingTested = Promise.resolve()
        .then(() => {
          return new Promise(resolve => setTimeout(() => {
            sequence.push('A');
            resolve();
          }, 1));
        })
        .then(() => {
          return new Promise(resolve => setTimeout(() => {
            sequence.push('B');
            resolve();
          }, 1));
        })
        .then(() => {
          sequence.push('C');
        });

    sequence.push('_');

    const testCode = Promise.resolve()
        .then(() => {
          sequence.push('a');
          clock.tick(1);
        })
        .then(() => {
          sequence.push('b');
        })
        .then(() => {
          sequence.push('c');
          clock.tick(1);
        })
        .then(() => {
          sequence.push('d');
        });

    Promise.all([promiseChainBeingTested, testCode]).then(() => {
      expect(sequence).to.deep.equal(['_', 'a', 'A', 'b', 'c', 'B', 'd', 'C']);
      done();
    }).catch(done);
  });

  it(`especially when one chain has a mix of immediate and async promises.`, done => {
    const promiseChainBeingTested = Promise.resolve()
        .then(() => {
          sequence.push('A');
        })
        .then(() => {
          return new Promise(resolve => setTimeout(() => {
            sequence.push('B');
            resolve();
          }, 1));
        })
        .then(() => {
          sequence.push('C');
        })
        .then(() => {
          return new Promise(resolve => setTimeout(() => {
            sequence.push('D');
            resolve();
          }, 1));
        });

    sequence.push('_');

    const testCode = Promise.resolve()
        .then(() => {
          sequence.push('a');
        })
        .then(() => {
          sequence.push('b');
          clock.tick(1);
        })
        .then(() => {
          sequence.push('c');
        })
        .then(() => {
          sequence.push('d');
        })
        .then(() => {
          sequence.push('e');
          clock.tick(1);
        });

    Promise.all([promiseChainBeingTested, testCode]).then(() => {
      expect(sequence).to.deep.equal(['_', 'A', 'a', 'b', 'B', 'c', 'C', 'd', 'e', 'D']);
      done();
    }).catch(done);
  });


  it(`By wrapping _real_ setTimeout our test can yield to the promise chain.`, done => {
    Promise.resolve()
        .then(() => {
          sequence.push('A');
        })
        .then(() => {
          sequence.push('B');
          return new Promise(resolve => setTimeout(() => {
            sequence.push('C');
            resolve();
          }, 1));
        })
        .then(() => {
          sequence.push('D');
          return new Promise(resolve => setTimeout(() => {
            sequence.push('E');
            resolve();
          }, 1));
        })
        .then(() => {
          sequence.push('F');
        });

    sequence.push('_');

    // This causes more nesting, but otherwise less complicated test code
    // that's somewhat less tied to implementation
    yieldToPromiseChain(() => {
      sequence.push('a');
      clock.tick(1);
      yieldToPromiseChain(() => {
        sequence.push('b');
        clock.tick(1);
        yieldToPromiseChain(() => {
          sequence.push('c');
          expect(sequence).to.deep.equal(['_', 'A', 'B', 'a', 'C', 'D', 'b', 'E', 'F', 'c']);
          done();
        });
      });
    });
  });
});
