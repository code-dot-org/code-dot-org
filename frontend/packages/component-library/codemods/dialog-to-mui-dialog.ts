/**
 * Codemod: move `@code-dot-org/component-library/dialog` consumers off the
 * `MuiDialog` / `MuiCustomDialog` names onto `Dialog` / `CustomDialog`.
 *
 * The `Mui` names were the MUI wrapper's while the DSCO dialog shipped beside
 * it. The DSCO source is deleted and the wrapper now ships under the plain
 * names only, so only imports and `jest.mock` factories are rewritten; local
 * names, JSX and references stay as written. Default imports already resolve
 * to the wrapper and are left alone. Idempotent. Enzyme string selectors and
 * module shapes it cannot rewrite are reported per file for hand work. See
 * codemods/README.md.
 *
 *   cd frontend/packages/component-library
 *   TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/dialog-to-mui-dialog.ts \
 *     --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register [--dry --print] <paths...>
 */

import type {
  API,
  ASTPath,
  CallExpression,
  FileInfo,
  ImportDeclaration,
  JSCodeshift,
  ObjectExpression,
} from 'jscodeshift';

const SOURCE = '@code-dot-org/component-library/dialog';

// '@/dialog' is the package-internal spelling of SOURCE.
const ENTRY_SOURCES = new Set([SOURCE, '@/dialog']);

// Package-internal paths, used by Modal.tsx.
const INTERNAL_SOURCES: Record<string, string> = {
  '@/dialog/MuiCustomDialog': '@/dialog/CustomDialog',
  '@/dialog/MuiDialog': '@/dialog/Dialog',
};

const RENAMES: Record<string, string> = {
  MuiDialog: 'Dialog',
  MuiCustomDialog: 'CustomDialog',
  MuiDialogProps: 'DialogProps',
  MuiCustomDialogProps: 'CustomDialogProps',
};

const MOCK_KEYS: Record<string, string> = {
  MuiDialog: 'Dialog',
  MuiCustomDialog: 'CustomDialog',
};

const DISPLAY_NAMES: Record<string, string> = {
  MuiDialog: 'Dialog',
  MuiCustomDialog: 'CustomDialog',
};

// Enzyme wrapper methods that take a selector as their first argument.
const ENZYME_SELECTOR_METHODS = new Set([
  'find',
  'filter',
  'closest',
  'children',
  'parents',
  'exists',
  'is',
  'not',
  'some',
  'every',
]);

type Located = {loc?: {start: {line: number}} | null};
type Property = ObjectExpression['properties'][number];

const stringOf = (node: unknown): string | undefined => {
  const n = node as {type?: string; value?: unknown};
  return (n?.type === 'StringLiteral' || n?.type === 'Literal') &&
    typeof n.value === 'string'
    ? n.value
    : undefined;
};

const nameOf = (node: unknown): string | undefined => {
  const n = node as {type?: string; name?: string};
  return n?.type === 'Identifier' ? n.name : stringOf(node);
};

const keyOf = (property: Property): string | undefined => {
  const {key, computed} = property as {key?: unknown; computed?: boolean};
  return computed ? undefined : nameOf(key);
};

// A new node, not an edited one: recast patches a shorthand specifier's shared source span and drops the alias.
function renameSpecifiers(j: JSCodeshift, decl: ImportDeclaration): boolean {
  let renamed = false;
  decl.specifiers = (decl.specifiers ?? []).map(spec => {
    const imported =
      spec.type === 'ImportSpecifier' ? nameOf(spec.imported) : undefined;
    if (!imported || !(imported in RENAMES)) return spec;
    const next = j.importSpecifier(
      j.identifier(RENAMES[imported]),
      j.identifier(spec.local?.name ?? imported),
    );
    Object.assign(next, {
      importKind: (spec as {importKind?: string}).importKind,
      comments: (spec as {comments?: unknown[]}).comments,
    });
    renamed = true;
    return next;
  });
  return renamed;
}

function transformer(file: FileInfo, api: API) {
  // tsx rejects `<T>x` casts, which are valid in .ts files.
  const j = api.jscodeshift.withParser(/\.ts$/.test(file.path) ? 'ts' : 'tsx');
  const root = j(file.source);
  const report = (node: Located, message: string) =>
    api.report(`line ${node.loc?.start.line ?? '?'}: ${message}`);
  const sourceOf = (node: unknown) =>
    j(node as Parameters<typeof j>[0]).toSource();
  let changed = false;

  // Enzyme matches a string selector against the display name, which is Dialog / CustomDialog again.
  root.find(j.CallExpression).forEach(path => {
    const {callee, arguments: args} = path.value;
    if (callee.type !== 'MemberExpression') return;
    const method = nameOf(callee.property);
    const selector = stringOf(args[0]);
    if (
      method &&
      ENZYME_SELECTOR_METHODS.has(method) &&
      selector &&
      selector in DISPLAY_NAMES
    ) {
      report(
        path.value,
        `.${method}('${selector}') matches a display name that no longer exists; use '${DISPLAY_NAMES[selector]}'.`,
      );
    }
  });

  // Transform 1: named imports from the entry point.
  root
    .find(j.ImportDeclaration)
    .filter(path => ENTRY_SOURCES.has(stringOf(path.value.source) ?? ''))
    .forEach(path => {
      const decl = path.value;
      if (
        (decl.specifiers ?? []).some(s => s.type === 'ImportNamespaceSpecifier')
      ) {
        report(decl, 'namespace import; check it for Mui members by hand.');
        return;
      }
      if (renameSpecifiers(j, decl)) changed = true;
    });

  // Transform 2: package-internal module paths.
  root
    .find(j.ImportDeclaration)
    .filter(path => (stringOf(path.value.source) ?? '') in INTERNAL_SOURCES)
    .forEach(path => {
      const decl = path.value;
      decl.source = j.stringLiteral(
        INTERNAL_SOURCES[stringOf(decl.source) as string],
      );
      renameSpecifiers(j, decl);
      changed = true;
    });

  // Transform 3: jest.mock factories that return an object literal.
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {name: 'jest'},
        property: {name: 'mock'},
      },
    })
    .forEach((path: ASTPath<CallExpression>) => {
      const [moduleName, factory] = path.value.arguments;
      if (!ENTRY_SOURCES.has(stringOf(moduleName) ?? '') || !factory) return;
      let returned: unknown;
      if (
        factory.type === 'ArrowFunctionExpression' ||
        factory.type === 'FunctionExpression'
      ) {
        returned = factory.body;
        if (factory.body.type === 'BlockStatement') {
          const returns = factory.body.body.filter(
            statement => statement.type === 'ReturnStatement',
          );
          returned =
            returns.length === 1 && returns[0].type === 'ReturnStatement'
              ? returns[0].argument
              : undefined;
        }
      }
      if ((returned as {type?: string})?.type !== 'ObjectExpression') {
        report(
          path.value,
          'jest.mock factory does not return an object literal; move its Mui keys by hand.',
        );
        return;
      }
      const object = returned as ObjectExpression;
      const byKey = new Map<string, Property>();
      object.properties.forEach(property => {
        const key = keyOf(property);
        if (key) byKey.set(key, property);
      });
      const properties: Property[] = [];
      for (const property of object.properties) {
        const key = keyOf(property);
        if (!key || !(key in MOCK_KEYS)) {
          properties.push(property);
          continue;
        }
        const plain = MOCK_KEYS[key];
        const existing = byKey.get(plain);
        if (!existing) {
          Object.assign(property, {key: j.identifier(plain), shorthand: false});
          properties.push(property);
          changed = true;
        } else if (
          (property.type === 'ObjectProperty' ||
            property.type === 'Property') &&
          (existing.type === 'ObjectProperty' ||
            existing.type === 'Property') &&
          sourceOf(property.value) === sourceOf(existing.value)
        ) {
          changed = true;
        } else {
          report(
            property,
            `jest.mock key '${key}' differs from its '${plain}' key; merge them by hand.`,
          );
          properties.push(property);
        }
      }
      object.properties = properties;
    });

  // Report only: shapes the transforms above do not reach.
  root
    .find(j.ExportNamedDeclaration)
    .filter(
      path =>
        ENTRY_SOURCES.has(stringOf(path.value.source) ?? '') &&
        (path.value.specifiers ?? []).some(
          spec => (nameOf(spec.local) ?? '') in RENAMES,
        ),
    )
    .forEach(path =>
      report(
        path.value,
        're-export of a Mui name; point it at the plain name by hand.',
      ),
    );
  root
    .find(j.CallExpression)
    .filter(path => {
      const {callee, arguments: args} = path.value;
      const loads =
        callee.type === 'Import' ||
        (callee.type === 'Identifier' && callee.name === 'require');
      return loads && ENTRY_SOURCES.has(stringOf(args[0]) ?? '');
    })
    .forEach(path =>
      report(
        path.value,
        'require() or import() of the entry point; check it for Mui members by hand.',
      ),
    );

  return changed
    ? root.toSource({
        quote: 'single',
        objectCurlySpacing: false,
        trailingComma: true,
        lineTerminator: '\n',
      })
    : file.source;
}

export default transformer;
