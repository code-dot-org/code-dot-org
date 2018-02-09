/** @file Utilities for doing cryptography widget calculations */
import memoize from 'fast-memoize';

export const primesInRange = memoize((n, m) => {
  let primes = [];
  if (n <= 2 && m >= 2) {
    primes.push(2);
  }
  for (let i = n; i <= m; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
});

const isPrime = memoize(n => {
  const upperDivisor = Math.sqrt(n) + 1;
  for (let i = 2; i < upperDivisor; i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
});

export const privateKeyList = memoize(publicModulus => {
  if (!publicModulus) {
    return [];
  }
  let potentialVals = [];
  let privateKeys = [];
  for (let i = 0; i < publicModulus - 2; i++) {
    potentialVals.push(i);
  }
  potentialVals[1] = 0;
  for (let j = 0; j < publicModulus - 2; j++) {
    if (potentialVals[j] !== 0) {
      privateKeys.push(j);
      const inverse = computePublicKey(j, publicModulus);
      potentialVals[inverse] = 0;
    }
  }
  return privateKeys;
});

/**
 * @param {number} a - private key
 * @param {number} m - public modulus
 * @return {number} public key
 */
export const computePublicKey = memoize((a,m) => {
  // Disable linting - code copied from original widget,
  // does some wonky stuff to convert a private key to
  // a public key
  /* eslint-disable */
  var v = 1;
  var d = a;
  var u = (a == 1);
  var t = 1-u;
  if (t == 1) {
    var c = m % a;
    u = Math.floor(m/a);
    while (c != 1 && t == 1) {
      var q = Math.floor(d/c);
      d = d % c;
      v = v + q*u;
      t = (d != 1);
      if (t == 1) {
        q = Math.floor(c/d);
        c = c % d;
        u = u + q*v;
      }
    }
    u = v*(1 - t) + t*(m - u);
  }
  return u;
  /* eslint-enable */
});
