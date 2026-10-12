//
// jscodeshift transform for the one-off shared constants move. It renames the
// module that apps read the generated constants from, and moves a renamed
// import up to the first import group. migrateSharedConstantsImports.js runs
// it under a pinned jscodeshift. Delete both files when the move is done.

const OLD_SOURCE = '@cdo/generated-scripts/sharedConstants';
const NEW_SOURCE = '@code-dot-org/shared-constants';

function isOldSource(node) {
  return (
    !!node &&
    (node.type === 'StringLiteral' || node.type === 'Literal') &&
    node.value === OLD_SOURCE
  );
}

// babel keeps the text of the original string in `extra`, and recast reprints
// that text instead of the new value. Dropping it makes recast print the new
// value with the quote style that toSource asks for.
function setNewSource(node) {
  node.value = NEW_SOURCE;
  delete node.extra;
  delete node.raw;
}

function isRequireCallee(callee) {
  return callee.type === 'Identifier' && callee.name === 'require';
}

function isJestModuleCallee(callee) {
  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'jest' &&
    callee.property.type === 'Identifier' &&
    (callee.property.name === 'mock' ||
      callee.property.name === 'requireActual')
  );
}

// recast carries a file header as a leading comment of the import below it. A
// moved import that goes above that import would push the header down the
// file, so hand the header to the moved import. This only applies when the
// displaced import starts the file, because only then is the comment above it
// a header rather than a note about the import.
function takeLeadingComments(fromNode, toNode) {
  const comments = fromNode.comments;
  if (!comments) {
    return;
  }
  const leading = comments.filter(comment => comment.leading);
  if (leading.length === 0) {
    return;
  }
  toNode.comments = leading;
  fromNode.comments = comments.filter(comment => !comment.leading);
}

// The old module sorts into the internal import group and the new one into the
// external group, so a renamed import has to move. eslint --fix will not carry
// an import across a side-effect import, so put it with the first import group
// here and leave the exact order and spacing to eslint.
function moveToFirstImportGroup(body, node) {
  const from = body.indexOf(node);
  const first = body.findIndex(
    statement => statement.type === 'ImportDeclaration'
  );
  if (first < 0 || from <= first) {
    return false;
  }
  if (first === 0) {
    takeLeadingComments(body[first], node);
  }
  body.splice(from, 1);
  body.splice(first, 0, node);
  return true;
}

// recast decides for itself where blank lines go around a statement it moved,
// and eslint cannot remove a blank line that lands inside an import group. So
// take every blank line out of the leading import block. eslint then puts the
// group separators back in the right places. The printed text is parsed again
// because only that gives line numbers for the text recast just produced.
function removeBlankLinesInImportBlock(j, source) {
  const body = j(source).get().node.program.body;
  let lastImportLine = 0;
  for (const statement of body) {
    if (statement.type !== 'ImportDeclaration') {
      break;
    }
    lastImportLine = statement.loc.end.line;
  }
  if (lastImportLine === 0) {
    return source;
  }
  const lines = source.split('\n');
  return [
    ...lines.slice(0, lastImportLine).filter(line => line.trim() !== ''),
    ...lines.slice(lastImportLine),
  ].join('\n');
}

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let changed = false;

  const imports = root
    .find(j.ImportDeclaration)
    .filter(path => isOldSource(path.node.source));

  imports.forEach(path => {
    setNewSource(path.node.source);
    changed = true;
  });

  root
    .find(j.CallExpression)
    .filter(
      path =>
        (isRequireCallee(path.node.callee) ||
          isJestModuleCallee(path.node.callee)) &&
        isOldSource(path.node.arguments[0])
    )
    .forEach(path => {
      setNewSource(path.node.arguments[0]);
      changed = true;
    });

  if (!changed) {
    return null;
  }

  const body = root.get().node.program.body;
  let moved = false;
  imports.forEach(path => {
    moved = moveToFirstImportGroup(body, path.node) || moved;
  });
  const source = root.toSource({quote: 'single', objectCurlySpacing: false});
  return moved ? removeBlankLinesInImportBlock(j, source) : source;
};
