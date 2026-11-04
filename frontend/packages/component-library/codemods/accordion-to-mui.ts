/**
 * Codemod: move `@code-dot-org/component-library/accordion` and
 * `.../accordion/faqAccordion` consumers onto `MuiAccordion` /
 * `MuiFAQAccordion`.
 *
 * The wrappers take the legacy props unchanged, so only imports and mock
 * factories are rewritten; local names, JSX and references stay as written.
 * A default import becomes a named one and merges into an existing named
 * value import from the same entry. Idempotent. Enzyme string selectors,
 * namespace imports, re-exports, require() / import() of either entry, and
 * mock factory keys it cannot copy are reported per file for hand work. See
 * src/accordion/ACCORDION_MIGRATION_TO_MUI.md and codemods/README.md.
 *
 *   cd frontend/packages/component-library
 *   TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/accordion-to-mui.ts \
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

type Entry = {
  // Name the default import becomes.
  defaultName: string;
  renames: Record<string, string>;
  // Mock factory keys and the Mui key added beside each.
  mockKeys: Record<string, string>;
};

const ENTRIES: Record<string, Entry> = {
  '@code-dot-org/component-library/accordion': {
    defaultName: 'MuiAccordion',
    renames: {
      default: 'MuiAccordion',
      Accordion: 'MuiAccordion',
      FAQAccordion: 'MuiFAQAccordion',
      AccordionProps: 'MuiAccordionProps',
      FAQAccordionProps: 'MuiFAQAccordionProps',
    },
    mockKeys: {
      default: 'MuiAccordion',
      Accordion: 'MuiAccordion',
      FAQAccordion: 'MuiFAQAccordion',
    },
  },
  '@code-dot-org/component-library/accordion/faqAccordion': {
    defaultName: 'MuiFAQAccordion',
    renames: {
      default: 'MuiFAQAccordion',
      FAQAccordion: 'MuiFAQAccordion',
      FAQAccordionProps: 'MuiFAQAccordionProps',
      FAQAccordionItem: 'MuiFAQAccordionItem',
    },
    mockKeys: {
      default: 'MuiFAQAccordion',
      FAQAccordion: 'MuiFAQAccordion',
    },
  },
};

const DISPLAY_NAMES: Record<string, string> = {
  Accordion: 'MuiAccordion',
  FAQAccordion: 'MuiFAQAccordion',
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

const MOCK_OBJECTS = new Set(['jest', 'vi']);
const MOCK_METHODS = new Set(['mock', 'doMock']);

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

const entryOf = (node: unknown): Entry | undefined => {
  const source = stringOf(node);
  return source !== undefined && source in ENTRIES
    ? ENTRIES[source]
    : undefined;
};

const isValueImport = (decl: ImportDeclaration) =>
  !decl.importKind || decl.importKind === 'value';

// A new node, not an edited one: recast patches a shorthand specifier's shared source span and drops the alias.
function renameSpecifiers(
  j: JSCodeshift,
  decl: ImportDeclaration,
  renames: Record<string, string>,
): boolean {
  let renamed = false;
  decl.specifiers = (decl.specifiers ?? []).map(spec => {
    const imported =
      spec.type === 'ImportSpecifier' ? nameOf(spec.imported) : undefined;
    if (!imported || !(imported in renames)) return spec;
    const next = j.importSpecifier(
      j.identifier(renames[imported]),
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

function factoryObject(factory: unknown): ObjectExpression | undefined {
  const f = factory as {type?: string; body?: unknown};
  if (f?.type !== 'ArrowFunctionExpression' && f?.type !== 'FunctionExpression')
    return undefined;
  let returned = f.body as {type?: string; body?: unknown[]} | undefined;
  if (returned?.type === 'BlockStatement') {
    const returns = (returned.body ?? []).filter(
      statement => (statement as {type?: string}).type === 'ReturnStatement',
    ) as {argument?: unknown}[];
    returned =
      returns.length === 1
        ? (returns[0].argument as typeof returned)
        : undefined;
  }
  return returned?.type === 'ObjectExpression'
    ? (returned as ObjectExpression)
    : undefined;
}

function transformer(file: FileInfo, api: API) {
  // tsx rejects `<T>x` casts, which are valid in .ts files.
  const j = api.jscodeshift.withParser(/\.ts$/.test(file.path) ? 'ts' : 'tsx');
  const root = j(file.source);
  const report = (node: Located, message: string) =>
    api.report(`line ${node.loc?.start.line ?? '?'}: ${message}`);
  let changed = false;

  // Enzyme matches a string selector against the display name, which becomes MuiAccordion / MuiFAQAccordion.
  // A test does not import the component it finds, so a match may be another Accordion, such as MUI's.
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
        `.${method}('${selector}'): if it targets the component-library accordion, use '${DISPLAY_NAMES[selector]}'.`,
      );
    }
  });

  // Transforms 1-4: imports from either entry point.
  for (const [source, entry] of Object.entries(ENTRIES)) {
    const sourceImports = root.find(j.ImportDeclaration, {
      source: {value: source},
    });

    sourceImports.forEach(path => {
      const decl = path.value;
      if (
        (decl.specifiers ?? []).some(s => s.type === 'ImportNamespaceSpecifier')
      ) {
        report(decl, 'namespace import; switch its members by hand.');
        return;
      }
      if (renameSpecifiers(j, decl, entry.renames)) changed = true;

      const specifiers = decl.specifiers ?? [];
      const defaultSpec = specifiers.find(
        s => s.type === 'ImportDefaultSpecifier',
      );
      if (!defaultSpec) return;
      const named = j.importSpecifier(
        j.identifier(entry.defaultName),
        j.identifier(defaultSpec.local?.name ?? entry.defaultName),
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
  }

  // Transform 5: jest.mock / jest.doMock / vi.mock / vi.doMock factories that return an object literal.
  root
    .find(j.CallExpression, {callee: {type: 'MemberExpression'}})
    .filter(path => {
      const callee = path.value.callee as {
        object?: unknown;
        property?: unknown;
      };
      return (
        MOCK_OBJECTS.has(nameOf(callee.object) ?? '') &&
        MOCK_METHODS.has(nameOf(callee.property) ?? '')
      );
    })
    .forEach((path: ASTPath<CallExpression>) => {
      const [moduleName, factory] = path.value.arguments;
      const entry = entryOf(moduleName);
      if (!entry || !factory) return;
      const object = factoryObject(factory);
      if (!object) {
        report(
          path.value,
          'mock factory does not return an object literal; add the Mui keys by hand.',
        );
        return;
      }
      const keys = new Set(object.properties.map(keyOf));
      // Two legacy keys for one Mui key (default and Accordion) leave the value to choose ambiguous.
      const ambiguous = new Set(
        Object.values(entry.mockKeys).filter(
          muiKey =>
            Object.entries(entry.mockKeys).filter(
              ([key, target]) => target === muiKey && keys.has(key),
            ).length > 1,
        ),
      );
      const reported = new Set<string>();
      const properties: Property[] = [];
      for (const property of object.properties) {
        properties.push(property);
        const key = keyOf(property);
        if (!key || !(key in entry.mockKeys)) continue;
        const muiKey = entry.mockKeys[key];
        if (keys.has(muiKey)) continue;
        if (ambiguous.has(muiKey)) {
          if (!reported.has(muiKey)) {
            report(
              property,
              `mock factory has more than one key for '${muiKey}'; add it by hand.`,
            );
          }
          reported.add(muiKey);
          continue;
        }
        const value = (property as {value?: {type?: string}}).value;
        const copyable =
          (property.type === 'ObjectProperty' ||
            property.type === 'Property') &&
          (value?.type === 'Identifier' ||
            value?.type === 'ArrowFunctionExpression' ||
            value?.type === 'FunctionExpression');
        if (!copyable) {
          report(
            property,
            `mock key '${key}' is not a name or a function; add '${muiKey}' by hand.`,
          );
          continue;
        }
        properties.push(
          j.objectProperty(
            j.identifier(muiKey),
            value as Parameters<typeof j.objectProperty>[1],
          ),
        );
        keys.add(muiKey);
        changed = true;
      }
      object.properties = properties;
    });

  // Report only: shapes the transforms above do not reach.
  for (const type of [j.ExportNamedDeclaration, j.ExportAllDeclaration]) {
    root
      .find(type)
      .filter(path => entryOf(path.value.source) !== undefined)
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
      return loads && entryOf(args[0]) !== undefined;
    })
    .forEach(path =>
      report(
        path.value,
        'require() or import() of an accordion entry point; switch its members by hand.',
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
