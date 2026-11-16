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
      code: `class A extends TypeError {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
    },
    // The restore may sit inside a block.
    {
      code: `class A extends Error {
  constructor() {
    try {
      super('x');
      Object.setPrototypeOf(this, new.target.prototype);
    } finally {
      log();
    }
  }
}`,
    },
    // A subclass of a fixed class inherits the new.target restore.
    {code: `class B extends A {}`},
    // A local binding named Error is not the built-in.
    {
      code: `import {Error} from './errors';
class A extends Error {}`,
    },
  ],
  invalid: [
    {
      code: `export class A extends Error {
  constructor(public readonly phase: string) {
    super('x'); // keep
    this.name = 'A';
  }
}`,
      output: `export class A extends Error {
  constructor(public readonly phase: string) {
    super('x'); // keep
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'A';
  }
}`,
      errors: 1,
    },
    {
      code: `class A extends Error {}`,
      output: `class A extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    ${COMMENT}
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
      errors: 1,
    },
    // A non-empty body gets no blank line after the new constructor.
    {
      code: `function f() {
  class A extends AggregateError {
    foo() {}
  }
}`,
      output: `function f() {
  class A extends AggregateError {
    constructor(...args: ConstructorParameters<typeof AggregateError>) {
      super(...args);
      ${COMMENT}
      Object.setPrototypeOf(this, new.target.prototype);
    }
    foo() {}
  }
}`,
      errors: 1,
    },
    // The class-name form breaks subclasses; it is rewritten in place.
    {
      code: `class A extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, A.prototype);
  }
}`,
      output: `class A extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
      errors: 1,
    },
    // So is a restore of some other class's prototype.
    {
      code: `const A = class extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, B.prototype);
  }
};`,
      output: `const A = class extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
  }
};`,
      errors: 1,
    },
    // No fix without a super() statement to anchor on.
    {
      code: `class A extends Error {
  constructor(flag) {
    flag ? super('a') : super('b');
  }
}`,
      output: null,
      errors: 1,
    },
  ],
});
