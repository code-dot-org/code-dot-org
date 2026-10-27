// A vector or a point as the text an inspector's field holds it in.

import {describe, expect, it} from 'vitest';

import {parseVectorText, vectorText} from '../worldProperties';

describe('a vector as text', () => {
  it('is two numbers and a comma, and reads back', () => {
    expect(vectorText({x: -1, y: 0.5})).toBe('-1,0.5');
    expect(parseVectorText('-1,0.5')).toEqual({x: -1, y: 0.5});
    expect(parseVectorText(' 3 , 4 ')).toEqual({x: 3, y: 4});
  });

  it('is nothing for text that is not one', () => {
    expect(parseVectorText('sideways')).toBeUndefined();
    expect(parseVectorText('1,2,3')).toBeUndefined();
    expect(parseVectorText('1,x')).toBeUndefined();
  });
});
