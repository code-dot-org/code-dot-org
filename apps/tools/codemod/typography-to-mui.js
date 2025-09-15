// jscodeshift codemod typography-to-mui

// What it does:
// - Rewrites DSCO <Typography semanticTag visualAppearance ...> to MUI <Typography component variant gutterBottom>
// - Rewrites wrapper components (Heading1, BodyTwoText, OverlineTwoText, etc.) to <Typography ...>
// - Preserves attributes like id, className, style, children, etc
// - Rewrites imports: removes DSCO Typography / wrapper imports; adds MUI Typography import

// Run:
//   npx jscodeshift -t ./apps/tools/codemod/typography-to-mui.js "src/**/*.{ts,tsx,js,jsx}" --parser=tsx --extensions=tsx,ts,jsx,js

// Tips:
//   - Add --dry --print to preview changes
//   - REMEMBER to wrap the component entrypoint with mui ThemeProvider or the theme styles will not be applied

// TODO: Delete this script when all DSCO Typography components have been replaced with MUI Typography

const VARIANT_TO_DEFAULT_TAG = {
  // built-in
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  // custom from variantMapping
  body3: 'p',
  body4: 'p',
  overline1: 'p',
  overline2: 'p',
  overline3: 'p',
  figcaption: 'figcaption',
  em: 'em',
  strong: 'strong',
  extraStrong: 'strong',
};

const WRAPPER_NAME_TO_DEFAULT = {
  // Headings
  Heading1: {component: 'h1', variant: 'h1'},
  Heading2: {component: 'h2', variant: 'h2'},
  Heading3: {component: 'h3', variant: 'h3'},
  Heading4: {component: 'h4', variant: 'h4'},
  Heading5: {component: 'h5', variant: 'h5'},
  Heading6: {component: 'h6', variant: 'h6'},

  // Body
  BodyOneText: {component: 'p', variant: 'body1'},
  BodyTwoText: {component: 'p', variant: 'body2'},
  BodyThreeText: {component: 'p', variant: 'body3'},
  BodyFourText: {component: 'p', variant: 'body4'},

  // Overlines
  OverlineOneText: {component: 'p', variant: 'overline1'},
  OverlineTwoText: {component: 'p', variant: 'overline2'},
  OverlineThreeText: {component: 'p', variant: 'overline3'},

  // Emphasis & strong
  EmText: {variant: 'em'},
  StrongText: {variant: 'strong'},
  ExtraStrongText: {
    variant: 'extraStrong',
  },

  // Figcaption
  Figcaption: {component: 'figcaption', variant: 'figcaption'},
};

const VISUAL_TO_VARIANT = {
  // headings
  'heading-xxl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',

  // body
  'body-one': 'body1',
  'body-two': 'body2',
  'body-three': 'body3',
  'body-four': 'body4',

  // overline
  'overline-one': 'overline1',
  'overline-two': 'overline2',
  'overline-three': 'overline3',

  // emphasis/strong
  em: 'em',
  strong: 'strong',
  'extra-strong': 'extraStrong',

  // figcaption
  figcaption: 'figcaption',
};

function ensureMuiTypographyImport(j, root) {
  // Prefer named import from @mui/material
  const pkg = '@mui/material';
  const existing = root.find(j.ImportDeclaration, {source: {value: pkg}});
  if (existing.size()) {
    let hasTypography = false;
    existing.forEach(path => {
      const specifiers = path.node.specifiers || [];
      if (
        specifiers.some(s => s.imported && s.imported.name === 'Typography')
      ) {
        hasTypography = true;
      }
    });
    if (!hasTypography) {
      existing
        .get(0)
        .node.specifiers.push(j.importSpecifier(j.identifier('Typography')));
    }
    return;
  }
  // If there is a default import from @mui/material/Typography, we’re fine too
  const direct = root.find(j.ImportDeclaration, {
    source: {value: '@mui/material/Typography'},
  });
  if (direct.size()) return;

  // Otherwise add: import { Typography } from '@mui/material';
  const firstImport = root.find(j.ImportDeclaration).at(0);
  const newDecl = j.importDeclaration(
    [j.importSpecifier(j.identifier('Typography'))],
    j.literal(pkg)
  );
  if (firstImport.size()) {
    firstImport.insertBefore(newDecl);
  } else {
    root.get().node.program.body.unshift(newDecl);
  }
}

function removeLocalTypographyAndWrapperImports(j, root) {
  // Remove any import that brings in our local Typography default OR named wrappers
  root.find(j.ImportDeclaration).forEach(path => {
    const decl = path.node;
    const sourceVal = decl.source.value || '';

    // If an import has a default specifier named 'Typography' BUT NOT from MUI, remove it.
    const defaultTypo =
      decl.specifiers &&
      decl.specifiers.find(
        s =>
          s.type === 'ImportDefaultSpecifier' && s.local.name === 'Typography'
      );
    const isFromMui =
      sourceVal === '@mui/material' || sourceVal === '@mui/material/Typography';

    // If default Typography from non-MUI path -> remove that specifier (or whole import if only one)
    if (defaultTypo && !isFromMui) {
      if (decl.specifiers.length === 1) {
        j(path).remove();
      } else {
        decl.specifiers = decl.specifiers.filter(s => s !== defaultTypo);
      }
    }

    // Remove named wrapper imports if present
    if (decl.specifiers) {
      const beforeLen = decl.specifiers.length;
      decl.specifiers = decl.specifiers.filter(s => {
        if (s.type !== 'ImportSpecifier') return true;
        const localName = s.local ? s.local.name : s.imported.name;
        return !Object.hasOwn(WRAPPER_NAME_TO_DEFAULT, localName);
      });
      if (
        beforeLen !== decl.specifiers.length &&
        decl.specifiers.length === 0
      ) {
        j(path).remove();
      }
    }
  });
}

function getJSXAttr(node, name) {
  return (node.attributes || []).find(
    a => a.type === 'JSXAttribute' && a.name && a.name.name === name
  );
}

function getAttrValueAsString(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'StringLiteral' || attr.value.type === 'Literal')
    return attr.value.value;
  if (attr.value.type === 'JSXExpressionContainer') {
    const expr = attr.value.expression;
    if (expr.type === 'StringLiteral' || expr.type === 'Literal')
      return expr.value;
  }
  return null;
}

function removeAttr(node, name) {
  node.attributes = (node.attributes || []).filter(
    a => !(a.type === 'JSXAttribute' && a.name && a.name.name === name)
  );
}

function isDynamicVisualAppearance(visAttr) {
  return (
    visAttr &&
    visAttr.value &&
    visAttr.value.type === 'JSXExpressionContainer' &&
    visAttr.value.expression &&
    visAttr.value.expression.type !== 'StringLiteral' &&
    visAttr.value.expression.type !== 'Literal'
  );
}

function addTodoComment(j, elementPath, label, payload) {
  const text = ` TODO_${label}: ${JSON.stringify(payload)} `;
  const empty = j.jsxEmptyExpression();
  empty.comments = [j.commentBlock(text, false, true)]; // {/* … */}
  const commentNode = j.jsxExpressionContainer(empty);
  const newline = j.jsxText('\n');

  const parent = elementPath.parent;
  const {children} = parent.node;
  if (Array.isArray(children)) {
    const idx = children.indexOf(elementPath.node);
    if (idx >= 0) {
      // Insert: JSX comment, then newline, then your element
      children.splice(idx, 0, commentNode, newline);
    }
  }
}

function toMuiTypography(j, path, inferred) {
  const opening = path.node.openingElement;

  // Rename tag to Typography
  opening.name = j.jsxIdentifier('Typography');
  if (path.node.closingElement) {
    path.node.closingElement.name = j.jsxIdentifier('Typography');
  }

  // component
  const hasComponent = !!getJSXAttr(opening, 'component');
  if (!hasComponent && inferred.component) {
    opening.attributes.push(
      j.jsxAttribute(
        j.jsxIdentifier('component'),
        j.stringLiteral(inferred.component)
      )
    );
  }

  // variant
  const hasVariant = !!getJSXAttr(opening, 'variant');
  if (!hasVariant && inferred.variant) {
    opening.attributes.push(
      j.jsxAttribute(
        j.jsxIdentifier('variant'),
        j.stringLiteral(inferred.variant)
      )
    );
  }

  // gutterBottom
  if (inferred.gutterBottom) {
    opening.attributes.push(j.jsxAttribute(j.jsxIdentifier('gutterBottom')));
  }

  // Remove redundant component if it matches the variant’s default element
  const variantAttr = getJSXAttr(opening, 'variant');
  const componentAttr = getJSXAttr(opening, 'component');
  const variantVal = getAttrValueAsString(variantAttr);
  const componentVal = getAttrValueAsString(componentAttr);

  if (
    variantVal &&
    componentVal &&
    VARIANT_TO_DEFAULT_TAG[variantVal] === componentVal
  ) {
    removeAttr(opening, 'component');
  }
}

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let fileChanged = false;

  // 1) Transform direct uses of our local Typography by presence of special props
  root
    .find(j.JSXElement, {
      openingElement: {name: {type: 'JSXIdentifier', name: 'Typography'}},
    })
    .forEach(p => {
      const opening = p.node.openingElement;

      // Only transform if it looks like our in-house Typography (has semanticTag or visualAppearance)
      const sem = getJSXAttr(opening, 'semanticTag');
      const vis = getJSXAttr(opening, 'visualAppearance');

      if (!sem && !vis) return;

      const semanticTag = getAttrValueAsString(sem) || 'div';
      const visualAppearance = getAttrValueAsString(vis);

      const inferred = {component: semanticTag};

      if (visualAppearance && VISUAL_TO_VARIANT[visualAppearance]) {
        inferred.variant = VISUAL_TO_VARIANT[visualAppearance];
      } else if (isDynamicVisualAppearance(vis)) {
        // Leave a breadcrumb with the original expression text
        const exprSrc = j(vis.value.expression).toSource();
        addTodoComment(j, p, 'visualAppearance_dynamic', exprSrc);
      } else if (visualAppearance) {
        // Unknown literal: breadcrumb
        addTodoComment(j, p, 'visualAppearance', visualAppearance);
      }

      const noMargin = getJSXAttr(opening, 'noMargin');
      if (!noMargin) {
        inferred.gutterBottom = true;
      }

      // Remove our props
      removeAttr(opening, 'semanticTag');
      removeAttr(opening, 'visualAppearance');
      removeAttr(opening, 'noMargin');

      // Convert element name + add component/variant
      toMuiTypography(j, p, inferred);
      fileChanged = true;
    });

  // 2) Transform wrapper components (Heading1, BodyTwoText, etc.)
  const wrapperNames = Object.keys(WRAPPER_NAME_TO_DEFAULT);

  root
    .find(j.JSXElement, {
      openingElement: {
        name: {type: 'JSXIdentifier'},
      },
    })
    .forEach(p => {
      const name = p.node.openingElement.name.name;
      if (!wrapperNames.includes(name)) return;

      const opening = p.node.openingElement;
      const inferred = {...WRAPPER_NAME_TO_DEFAULT[name]};

      // If wrapper has visualAppearance override, respect it
      const vis = getJSXAttr(opening, 'visualAppearance');
      const visualAppearance = getAttrValueAsString(vis);
      if (visualAppearance && VISUAL_TO_VARIANT[visualAppearance]) {
        inferred.variant = VISUAL_TO_VARIANT[visualAppearance];
      } else if (isDynamicVisualAppearance(vis)) {
        // Leave a breadcrumb with the original expression text
        const exprSrc = j(vis.value.expression).toSource();
        addTodoComment(j, p, 'visualAppearance_dynamic', exprSrc);
      } else if (visualAppearance) {
        // Unknown literal: breadcrumb
        addTodoComment(j, p, 'visualAppearance', visualAppearance);
      }

      const noMargin = getJSXAttr(opening, 'noMargin');
      if (!noMargin) {
        inferred.gutterBottom = true;
      }

      // Remove wrapper-only props we don’t need
      removeAttr(opening, 'visualAppearance');
      removeAttr(opening, 'noMargin');

      // Rename element and inject component/variant/gutterBottom
      toMuiTypography(j, p, inferred);
      fileChanged = true;
    });

  if (fileChanged) {
    // 3) Fix imports
    removeLocalTypographyAndWrapperImports(j, root);
    ensureMuiTypographyImport(j, root);
    return root.toSource({quote: 'single', reuseWhitespace: false});
  }

  return file.source;
}

module.exports = transformer;
