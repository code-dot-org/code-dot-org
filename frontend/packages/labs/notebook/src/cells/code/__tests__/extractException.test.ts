import {describe, expect, it} from 'vitest';

import {extractException} from '../extractException';

describe('extractException', () => {
  it('parses a NameError traceback into structured fields', () => {
    const raw =
      'Traceback (most recent call last):\n' +
      '  File "<exec>", line 1, in <module>\n' +
      "NameError: name 'undefined_name' is not defined";

    expect(extractException(raw)).toEqual({
      name: 'NameError',
      message: "name 'undefined_name' is not defined",
      line: 1,
    });
  });

  it('parses a SyntaxError without a traceback header', () => {
    const raw =
      '  File "<exec>", line 1\n' +
      '    print undefined\n' +
      '          ^\n' +
      'SyntaxError: invalid syntax';

    expect(extractException(raw)).toEqual({
      name: 'SyntaxError',
      message: 'invalid syntax',
      line: 1,
    });
  });

  it('parses a TypeError with a line number', () => {
    const raw =
      'Traceback (most recent call last):\n' +
      '  File "<exec>", line 3, in <module>\n' +
      "TypeError: unsupported operand type(s) for +: 'int' and 'str'";

    expect(extractException(raw)).toEqual({
      name: 'TypeError',
      message: "unsupported operand type(s) for +: 'int' and 'str'",
      line: 3,
    });
  });

  it('uses the last frame line number when multiple frames are present', () => {
    // A multi-frame traceback where the inner frame is at line 5 and the
    // outer (direct error site) is at line 12.  We want line 12.
    const raw =
      'Traceback (most recent call last):\n' +
      '  File "<exec>", line 5, in helper\n' +
      '  File "<exec>", line 12, in <module>\n' +
      'RuntimeError: something broke';

    const result = extractException(raw);
    expect(result.line).toBe(12);
  });

  it('leaves line undefined when no <exec> frame is present', () => {
    // Tracebacks from C extensions or frozen modules have no <exec> frame.
    const raw =
      'Traceback (most recent call last):\n' +
      '  File "/usr/lib/python3.11/ssl.py", line 100, in connect\n' +
      'ConnectionError: timed out';

    const result = extractException(raw);
    expect(result.line).toBeUndefined();
  });

  it('falls back to { name: "Error", message: trimmed input } for unparseable strings', () => {
    const raw = '   this is not a python traceback at all   ';

    expect(extractException(raw)).toEqual({
      name: 'Error',
      message: 'this is not a python traceback at all',
    });
    // No line field on the fallback object.
    expect('line' in extractException(raw)).toBe(false);
  });
});
