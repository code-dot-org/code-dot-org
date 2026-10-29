import {describe, expect, it} from 'vitest';

import CustomMarshaler from '../CustomMarshaler';
import CustomMarshalingInterpreter from '../CustomMarshalingInterpreter';

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  sum(): number {
    return this.x + this.y;
  }
}

describe('CustomMarshalingInterpreter', () => {
  it('keeps the marshaler it was constructed with', () => {
    const marshaler = new CustomMarshaler({objectList: [{instance: Point}]});
    const interpreter = new CustomMarshalingInterpreter(
      'var total = makePoint(2, 3).sum();',
      marshaler,
      (created, scope) =>
        created.marshalNativeToInterpreterObject(
          {makePoint: (x: number, y: number) => new Point(x, y)},
          5,
          scope,
        ),
    );
    expect(interpreter.customMarshaler).toBe(marshaler);
    interpreter.run();
    const total = interpreter.getProperty(interpreter.global, 'total');
    expect(interpreter.marshalInterpreterToNative(total)).toBe(5);
  });

  it('keeps an async function list set while it is built', () => {
    const wait = () => {};
    const interpreter = new CustomMarshalingInterpreter(
      '',
      new CustomMarshaler({}),
      created => {
        created.asyncFunctionList = [wait];
      },
    );
    expect(interpreter.asyncFunctionList).toEqual([wait]);
  });
});
