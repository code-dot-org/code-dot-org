import {RuleTester} from 'eslint';

import rule from '../../../eslint/rules/error-subclass-prototype';

const COMMENT =
  "// Under the ES5 build target the instance would keep Error's prototype.";

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
});

ruleTester.run('error-subclass-prototype', rule, {
  valid: [
    {
      code: `class A extends Error {
  constructor() {
    super('x');
    Object.setPrototypeOf(this, A.prototype);
  }
}`,
    },
    {
      code: `class A extends TypeError {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
    },
    // A subclass of a fixed class needs nothing of its own.
    {code: `class B extends A {}`},
    // A local binding named Error is not the built-in.
    {
      code: `import {Error} from './errors';
class A extends Error {}`,
    },
  ],
  invalid: [
    {
      filename: 'a.ts',
      code: `export class A extends Error {
  constructor(public readonly phase: string) {
    super('x');
    this.name = 'A';
  }
}`,
      output: `export class A extends Error {
  constructor(public readonly phase: string) {
    super('x');
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'A';
  }
}`,
      errors: 1,
    },
    {
      filename: 'a.ts',
      code: `class A extends Error {}`,
      output: `class A extends Error {
  constructor(message?: string) {
    super(message);
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
      errors: 1,
    },
    {
      filename: 'a.js',
      code: `class A extends RangeError {}`,
      output: `class A extends RangeError {
  constructor(message) {
    super(message);
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
      errors: 1,
    },
    // Restoring some other class's prototype does not count.
    {
      code: `class A extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, B.prototype);
  }
}`,
      output: `class A extends Error {
  constructor() {
    super();
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
    Object.setPrototypeOf(this, B.prototype);
  }
}`,
      errors: 1,
    },
    // No fix without a plain super() statement to anchor on.
    {
      code: `class A extends Error {
  constructor(flag) {
    if (flag) {
      super('a');
    } else {
      super('b');
    }
  }
}`,
      output: null,
      errors: 1,
    },
  ],
});
