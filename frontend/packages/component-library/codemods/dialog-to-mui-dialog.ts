/**
 * Codemod: move `@code-dot-org/component-library/dialog` consumers onto
 * `MuiDialog` / `MuiCustomDialog`.
 *
 * The wrappers take the legacy props unchanged, so only imports and
 * `jest.mock` factories are rewritten; local names, JSX and references stay
 * as written. Idempotent. Enzyme string selectors and module shapes it cannot
 * rewrite are reported per file for hand work. See codemods/README.md.
 *
 *   cd frontend/packages/component-library
 *   yarn codemod:dialog [--dry --print] <paths...>
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

// Package-internal paths, used by Modal.tsx.
const INTERNAL_SOURCES: Record<string, string> = {
  '@/dialog/CustomDialog': '@/dialog/MuiCustomDialog',
  '@/dialog/Dialog': '@/dialog/MuiDialog',
};

const RENAMES: Record<string, string> = {
  Dialog: 'MuiDialog',
  CustomDialog: 'MuiCustomDialog',
  DialogProps: 'MuiDialogProps',
  CustomDialogProps: 'MuiCustomDialogProps',
};

const MOCK_KEYS: Record<string, string> = {
  default: 'MuiDialog',
  Dialog: 'MuiDialog',
  CustomDialog: 'MuiCustomDialog',
};

const DISPLAY_NAMES: Record<string, string> = {
  Dialog: 'MuiDialog',
  CustomDialog: 'MuiCustomDialog',
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
  const j = api.jscodeshift;
  const root = j(file.source);
  const report = (node: Located, message: string) =>
    api.report(`line ${node.loc?.start.line ?? '?'}: ${message}`);
  let changed = false;

  // Enzyme matches a string selector against the display name, which becomes MuiDialog / MuiCustomDialog.
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
        `.${method}('${selector}') matches the legacy display name; use '${DISPLAY_NAMES[selector]}'.`,
      );
    }
  });

  const sourceImports = root.find(j.ImportDeclaration, {
    source: {value: SOURCE},
  });

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
      j.identifier('MuiDialog'),
      j.identifier(defaultSpec.local?.name ?? 'Dialog'),
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
    j(path).remove();
  });

  // Transform 4: package-internal default imports.
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

  // Transform 5: jest.mock factories that return an object literal.
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
      if (stringOf(moduleName) !== SOURCE || !factory) return;
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
          'jest.mock factory does not return an object literal; add the Mui keys by hand.',
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
            `jest.mock key '${key}' is a method; add '${MOCK_KEYS[key]}' by hand.`,
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
