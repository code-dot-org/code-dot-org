import {useMemo} from 'react';

// We're only going to allow partial application on functions which accept an object as the sole argument.'
type StringRecordType = Record<string, unknown>;

// the function we will partially apply to must accept a single argument, with unknown return.
type PartialApplicationFunctionType<T extends StringRecordType> = (
  arg: T
) => unknown;

// if you wanna get really fancy, you can use this utility to ensure that your partial args match the function.
// eslint-disable-next-line
export type PAFunctionArgs<
  F extends PartialApplicationFunctionType<any> // eslint-disable-line
> = Partial<Parameters<F>[0]>;

// Here's where the magic is.
// We accept a function (which must take a StringRecordType) and a second object, should only contain keys into
// the object accepted as our first functions argument.
// We'll then generate a closure which will capture that second object. The closure will invoke the original
// function and hand along the initial args + any calling args.
//
// And it's all fully typesafe.
//
// const someFunction = ({a,b,c} : {a : number, b : number, c : string}) => a + b
// const partial = partialApply(someFunction, {a : 3})
// someFunction({a : 1, b : 2, c : 'test'}) // works and returns 3
// someFunction({b : 2, c : 'test'})        // fails because 'a' is not provided
// partial({b : 2, c : 'test'})             // works and returns 3, because 'a' was passed in via the closure.
//
// fancy syntax:
// const partial2 = partialApply(someFunction, {a : 3, d : 7} satisfies PAFunctionArgs<typeof someFunction>)
//       ^^^ this one fails because 'd' is not part of the arg object to someFunction.
export function partialApply<T extends StringRecordType, U extends Partial<T>>(
  f: PartialApplicationFunctionType<T>,
  initArgs: U
) {
  // take a union type of the keys of our initialization object
  const keys = Object.keys(initArgs)[0] as keyof U;
  // use that list of keys to build a new partial type for those keys, typed the same way as we were given
  type InitArgsType = Partial<{[K in typeof keys]: (typeof initArgs)[K]}>;
  // and then take our original function's object argument type and remove the keys from our init object,
  // then intersect it with our new type that's allowing optional use of those keys.
  type PartialArgsType = Omit<T, typeof keys> & InitArgsType;

  return (args: PartialArgsType) => f({...initArgs, ...args} as T);
}

export function usePartialApply<
  T extends StringRecordType,
  U extends Partial<T>
>(f: PartialApplicationFunctionType<T>, initArgs: U) {
  return useMemo(() => partialApply(f, initArgs), [f, initArgs]);
}
