// Under the ES5 build target a class extending Error keeps Error's own
// prototype: Error's constructor returns its own object, so `instanceof
// Subclass` is false unless the constructor sets the prototype back.
// swc and Babel wrap native constructors to avoid this; ts-loader does
// not, so the bug reaches the webpack build through TypeScript alone.
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

const COMMENT =
  "// Under the ES5 build target the instance would keep Error's prototype.";

function isGlobal(sourceCode, identifier) {
  let scope = sourceCode.getScope(identifier);
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable && variable.defs.length) return false;
    scope = scope.upper;
  }
  return true;
}

// Every statement in a block, including those nested in blocks, try
// statements and if statements, in source order.
function* statementsIn(block) {
  for (const statement of block.body) {
    yield statement;
    for (const inner of nestedBlocks(statement)) yield* statementsIn(inner);
  }
}

function nestedBlocks(statement) {
  switch (statement.type) {
    case 'BlockStatement':
      return [statement];
    case 'TryStatement':
      return [
        statement.block,
        statement.handler && statement.handler.body,
        statement.finalizer,
      ].filter(Boolean);
    case 'IfStatement':
      return [statement.consequent, statement.alternate].filter(
        node => node && node.type === 'BlockStatement'
      );
    default:
      return [];
  }
}

function isSuperCall(statement) {
  return (
    statement.type === 'ExpressionStatement' &&
    statement.expression.type === 'CallExpression' &&
    statement.expression.callee.type === 'Super'
  );
}

// Object.setPrototypeOf(this, <owner>.prototype): the owner node, or null.
function prototypeOwner(statement) {
  if (statement.type !== 'ExpressionStatement') return null;
  const call = statement.expression;
  if (call.type !== 'CallExpression' || call.arguments.length !== 2) {
    return null;
  }
  const {callee} = call;
  if (
    callee.type !== 'MemberExpression' ||
    callee.object.type !== 'Identifier' ||
    callee.object.name !== 'Object' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== 'setPrototypeOf'
  ) {
    return null;
  }
  const [target, prototype] = call.arguments;
  if (
    target.type !== 'ThisExpression' ||
    prototype.type !== 'MemberExpression' ||
    prototype.property.type !== 'Identifier' ||
    prototype.property.name !== 'prototype'
  ) {
    return null;
  }
  return prototype.object;
}

function isNewTarget(node) {
  return (
    node.type === 'MetaProperty' &&
    node.meta.name === 'new' &&
    node.property.name === 'target'
  );
}

function indentOf(sourceCode, node) {
  const line = sourceCode.lines[node.loc.start.line - 1];
  return line.slice(0, line.length - line.trimStart().length);
}

// The last token or comment on the statement's line, so an insertion
// after it keeps a trailing comment where it was.
function endOfLine(sourceCode, statement) {
  let last = statement;
  for (;;) {
    const next = sourceCode.getTokenAfter(last, {includeComments: true});
    if (!next || next.loc.start.line !== statement.loc.end.line) return last;
    last = next;
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require Error subclasses to restore their prototype with new.target, which the ES5 build target drops',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    function check(classNode) {
      const base = classNode.superClass;
      if (
        !base ||
        base.type !== 'Identifier' ||
        !NATIVE_ERRORS.has(base.name) ||
        !isGlobal(sourceCode, base)
      ) {
        return;
      }
      const data = {
        name: classNode.id ? classNode.id.name : 'this class',
        base: base.name,
      };
      const constructor = classNode.body.body.find(
        member =>
          member.type === 'MethodDefinition' && member.kind === 'constructor'
      );

      if (!constructor) {
        context.report({
          node: classNode.id || classNode,
          message:
            '{{name}} extends {{base}} without a constructor; under the ES5 build target `instanceof {{name}}` is false. Add one that calls Object.setPrototypeOf(this, new.target.prototype) after super().',
          data,
          fix(fixer) {
            const classIndent = indentOf(sourceCode, classNode);
            const indent = classIndent + '  ';
            const lines = [
              '',
              `${indent}constructor(...args: ConstructorParameters<typeof ${base.name}>) {`,
              `${indent}  super(...args);`,
              `${indent}  ${COMMENT}`,
              `${indent}  Object.setPrototypeOf(this, new.target.prototype);`,
              `${indent}}`,
            ];
            if (classNode.body.body.length === 0) lines.push(classIndent);
            const openBrace = sourceCode.getFirstToken(classNode.body);
            return fixer.insertTextAfter(openBrace, lines.join('\n'));
          },
        });
        return;
      }

      const statements = [...statementsIn(constructor.value.body)];
      const restore = statements.find(statement => prototypeOwner(statement));
      if (restore) {
        const owner = prototypeOwner(restore);
        if (isNewTarget(owner)) return;
        context.report({
          node: owner,
          message:
            'Restore the prototype from new.target, not {{owner}}: a subclass of {{name}} would otherwise keep {{name}}.prototype.',
          data: {...data, owner: sourceCode.getText(owner)},
          fix: fixer => fixer.replaceText(owner, 'new.target'),
        });
        return;
      }

      const superCall = statements.find(isSuperCall);
      context.report({
        node: constructor.key,
        message:
          '{{name}} extends {{base}}; under the ES5 build target `instanceof {{name}}` is false. Add Object.setPrototypeOf(this, new.target.prototype) after super().',
        data,
        fix: superCall
          ? fixer => {
              const indent = indentOf(sourceCode, superCall);
              return fixer.insertTextAfter(
                endOfLine(sourceCode, superCall),
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
