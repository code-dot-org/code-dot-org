/**
 * Codemod: move `@code-dot-org/component-library/divider` consumers onto
 * `MuiDivider`.
 *
 * The wrapper takes the legacy props unchanged, so only imports and mock
 * factories are rewritten; local names, JSX and references stay as written.
 *
 *   import Divider from '…/divider'          -> import {MuiDivider as Divider} from '…/divider'
 *   import {Divider as Rule} from '…/divider' -> import {MuiDivider as Rule} from '…/divider'
 *   import type {DividerProps} from '…'       -> import type {MuiDividerProps as DividerProps} from '…'
 *
 * A default-only import merges into another named import of the same kind
 * from the same source. `jest.mock`, `jest.doMock`, `vi.mock` and `vi.doMock`
 * factories that return one object literal gain a `MuiDivider` key beside a
 * `default` or `Divider` key whose value is a name or a function.
 *
 * Idempotent: specifiers and keys already on the Mui names are left alone.
 * Reported per file for hand work, not rewritten: Enzyme string selectors
 * naming `Divider`, other mock shapes, namespace imports, re-exports, and
 * `require()` / `import()` of the entry point. `.ts` files are parsed with
 * the `ts` parser. See src/divider/DIVIDER_MIGRATION_TO_MUI.md.
 *
 *   cd frontend/packages/component-library
 *   TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/divider-to-mui-divider.ts \
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

const SOURCE = '@code-dot-org/component-library/divider';

const RENAMES: Record<string, string> = {
  default: 'MuiDivider',
  Divider: 'MuiDivider',
  DividerProps: 'MuiDividerProps',
};

const MOCK_KEYS: Record<string, string> = {
  default: 'MuiDivider',
  Divider: 'MuiDivider',
};

const MOCK_CALLS: Record<string, Set<string>> = {
  jest: new Set(['mock', 'doMock']),
  vi: new Set(['mock', 'doMock']),
};

const DISPLAY_NAMES: Record<string, string> = {
  Divider: 'MuiDivider',
};

// Copying any other value would duplicate a side effect, such as a second vi.fn().
const COPYABLE_MOCK_VALUES = new Set([
  'Identifier',
  'ArrowFunctionExpression',
  'FunctionExpression',
]);

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

const mockCallOf = (callee: CallExpression['callee']): string | undefined => {
  if (callee.type !== 'MemberExpression' || callee.computed) return undefined;
  const object = nameOf(callee.object);
  const method = nameOf(callee.property);
  return object && method && MOCK_CALLS[object]?.has(method)
    ? `${object}.${method}`
    : undefined;
};

const isValueImport = (decl: ImportDeclaration) =>
  !decl.importKind || decl.importKind === 'value';

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
  let changed = false;

  // Enzyme matches a string selector against the display name, which becomes MuiDivider.
  // A test does not import the divider it finds, so a match may be another Divider, such as MUI's.
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
        `.${method}('${selector}'): if it targets the component-library divider, use '${DISPLAY_NAMES[selector]}'.`,
      );
    }
  });

  const sourceImports = root.find(j.ImportDeclaration, {
    source: {value: SOURCE},
  });

  // A merged import is removed; its path stays in sourceImports with no value.
  const merged = new Set<ASTPath<ImportDeclaration>>();

  // Transforms 1-3: imports from the public entry point.
  sourceImports.forEach(path => {
    const decl = path.value;
    if (
      (decl.specifiers ?? []).some(s => s.type === 'ImportNamespaceSpecifier')
    ) {
      report(decl, 'namespace import; switch its members by hand.');
      return;
    }
    if (renameSpecifiers(j, decl)) changed = true;

    const specifiers = decl.specifiers ?? [];
    const defaultSpec = specifiers.find(
      s => s.type === 'ImportDefaultSpecifier',
    );
    if (!defaultSpec) return;
    const named = j.importSpecifier(
      j.identifier('MuiDivider'),
      j.identifier(defaultSpec.local?.name ?? 'Divider'),
    );
    const rest = specifiers.filter(s => s !== defaultSpec);
    changed = true;

    // A default-only import merges into another named import of the same kind, if one exists.
    const target =
      rest.length === 0
        ? sourceImports
            .filter(
              other =>
                other !== path &&
                !merged.has(other) &&
                isValueImport(other.value) === isValueImport(decl) &&
                (other.value.specifiers ?? []).some(
                  s => s.type === 'ImportSpecifier',
                ),
            )
            .paths()[0]
        : undefined;
    if (!target) {
      decl.specifiers = [named, ...rest];
      return;
    }
    target.value.specifiers = [named, ...(target.value.specifiers ?? [])];
    const comments = (decl as {comments?: unknown[]}).comments;
    if (comments?.length) {
      const targetNode = target.value as {comments?: unknown[]};
      targetNode.comments = [...comments, ...(targetNode.comments ?? [])];
    }
    merged.add(path);
    j(path).remove();
  });

  // Transform 4: mock factories that return an object literal.
  root
    .find(j.CallExpression)
    .filter(path => mockCallOf(path.value.callee) !== undefined)
    .forEach((path: ASTPath<CallExpression>) => {
      const [moduleName, factory] = path.value.arguments;
      if (stringOf(moduleName) !== SOURCE || !factory) return;
      const call = mockCallOf(path.value.callee);
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
          `${call} factory does not return an object literal; add the MuiDivider key by hand.`,
        );
        return;
      }
      const object = returned as ObjectExpression;
      const keys = new Set(object.properties.map(keyOf));
      const properties: Property[] = [];
      for (const property of object.properties) {
        properties.push(property);
        const key = keyOf(property);
        if (!key || !(key in MOCK_KEYS) || keys.has(MOCK_KEYS[key])) continue;
        if (
          property.type !== 'ObjectProperty' &&
          property.type !== 'Property'
        ) {
          report(
            property,
            `${call} key '${key}' is a method; add '${MOCK_KEYS[key]}' by hand.`,
          );
          continue;
        }
        if (!COPYABLE_MOCK_VALUES.has(property.value.type)) {
          report(
            property,
            `${call} key '${key}' is not a name or a function; add '${MOCK_KEYS[key]}' by hand.`,
          );
          continue;
        }
        properties.push(
          j.objectProperty(
            j.identifier(MOCK_KEYS[key]),
            property.value as Parameters<typeof j.objectProperty>[1],
          ),
        );
        keys.add(MOCK_KEYS[key]);
        changed = true;
      }
      object.properties = properties;
    });

  // Report only: shapes the transforms above do not reach.
  for (const type of [j.ExportNamedDeclaration, j.ExportAllDeclaration]) {
    root
      .find(type)
      .filter(path => stringOf(path.value.source) === SOURCE)
      .forEach(path =>
        report(path.value, 're-export; point it at the Mui names by hand.'),
      );
  }
  root
    .find(j.CallExpression)
    .filter(path => {
      const {callee, arguments: args} = path.value;
      const loads =
        callee.type === 'Import' ||
        (callee.type === 'Identifier' && callee.name === 'require');
      return loads && stringOf(args[0]) === SOURCE;
    })
    .forEach(path =>
      report(
        path.value,
        'require() or import() of the entry point; switch its members by hand.',
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
