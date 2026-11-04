// A class extending Error loses its prototype under the ES5 build target:
// Error's constructor returns its own object, so `instanceof Subclass` is
// false unless the constructor sets the prototype back.  swc papers over
// this and ts-loader does not, so the bug shows only in the webpack build.
// https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work

const NATIVE_ERRORS = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'ReferenceError',
  'EvalError',
  'URIError',
  'AggregateError',
  'DOMException',
]);

// Error subclasses whose constructor takes a single optional message.
const MESSAGE_ONLY = new Set(
  [...NATIVE_ERRORS].filter(
    name => name !== 'AggregateError' && name !== 'DOMException'
  )
);

const COMMENT =
  "// Under the ES5 build target the instance would keep Error's prototype.";

function isGlobal(context, identifier) {
  let scope = context.getScope();
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable && variable.defs.length) return false;
    scope = scope.upper;
  }
  return true;
}

function constructorOf(classNode) {
  return classNode.body.body.find(
    member =>
      member.type === 'MethodDefinition' && member.kind === 'constructor'
  );
}

function superCallStatement(constructor) {
  return constructor.value.body.body.find(
    statement =>
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'CallExpression' &&
      statement.expression.callee.type === 'Super'
  );
}

// Object.setPrototypeOf(this, X.prototype) or (this, new.target.prototype).
function restoresPrototype(statement, className) {
  if (statement.type !== 'ExpressionStatement') return false;
  const call = statement.expression;
  if (call.type !== 'CallExpression' || call.arguments.length !== 2) {
    return false;
  }
  const {callee} = call;
  if (
    callee.type !== 'MemberExpression' ||
    callee.object.type !== 'Identifier' ||
    callee.object.name !== 'Object' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== 'setPrototypeOf'
  ) {
    return false;
  }
  const [target, prototype] = call.arguments;
  if (target.type !== 'ThisExpression') return false;
  if (
    prototype.type !== 'MemberExpression' ||
    prototype.property.type !== 'Identifier' ||
    prototype.property.name !== 'prototype'
  ) {
    return false;
  }
  const owner = prototype.object;
  return (
    (owner.type === 'MetaProperty' &&
      owner.meta.name === 'new' &&
      owner.property.name === 'target') ||
    (owner.type === 'Identifier' && owner.name === className)
  );
}

function indentOf(sourceCode, node) {
  const line = sourceCode.lines[node.loc.start.line - 1];
  return line.slice(0, line.length - line.trimStart().length);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require Error subclasses to restore their prototype, which the ES5 build target drops',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const isTypeScript = /\.tsx?$/.test(context.getFilename());

    function check(classNode) {
      const base = classNode.superClass;
      if (
        !base ||
        base.type !== 'Identifier' ||
        !NATIVE_ERRORS.has(base.name) ||
        !isGlobal(context, base)
      ) {
        return;
      }
      const className = classNode.id && classNode.id.name;
      const constructor = constructorOf(classNode);
      if (
        constructor &&
        constructor.value.body.body.some(statement =>
          restoresPrototype(statement, className)
        )
      ) {
        return;
      }

      const data = {name: className || 'this class', base: base.name};
      if (!constructor) {
        context.report({
          node: classNode.id || classNode,
          message:
            '{{name}} extends {{base}} without a constructor; under the ES5 build target `instanceof {{name}}` is false. Add one that calls Object.setPrototypeOf(this, new.target.prototype) after super().',
          data,
          fix: MESSAGE_ONLY.has(base.name)
            ? fixer => {
                const classIndent = indentOf(sourceCode, classNode);
                const indent = classIndent + '  ';
                const param = isTypeScript ? 'message?: string' : 'message';
                const body = [
                  '',
                  `${indent}constructor(${param}) {`,
                  `${indent}  super(message);`,
                  `${indent}  ${COMMENT}`,
                  `${indent}  Object.setPrototypeOf(this, new.target.prototype);`,
                  `${indent}}`,
                  classIndent,
                ].join('\n');
                const openBrace = sourceCode.getFirstToken(classNode.body);
                return fixer.insertTextAfter(openBrace, body);
              }
            : null,
        });
        return;
      }

      const superCall = superCallStatement(constructor);
      context.report({
        node: constructor.key,
        message:
          '{{name}} extends {{base}}; under the ES5 build target `instanceof {{name}}` is false. Add Object.setPrototypeOf(this, new.target.prototype) after super().',
        data,
        fix: superCall
          ? fixer => {
              const indent = indentOf(sourceCode, superCall);
              return fixer.insertTextAfter(
                superCall,
                `\n${indent}${COMMENT}\n${indent}Object.setPrototypeOf(this, new.target.prototype);`
              );
            }
          : null,
      });
    }

    return {
      ClassDeclaration: check,
      ClassExpression: check,
    };
  },
};
