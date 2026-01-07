/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */ /**

 * Codemod to transform Button/LinkButton components to MUI Button/IconButton
 *
 * Usage (from component-library package):
 *
 *   cd frontend/packages/component-library
 *   yarn codemod:buttons -- ../../apps/src/templates/curriculumCatalog/*.jsx
 *
 * This codemod uses the shared `transformButtonPropsCore` logic from
 * `src/button/buttonPropsToMuiCore.ts` to compute MUI `variant`/`color`/`size`,
 * link props, and pending state, and then reconstructs `<MuiButton>` /
 * `<MuiIconButton>` JSX using the original `iconLeft`/`iconRight`/`icon`
 * expressions so we don't lose any custom props.
 */

import type {API, FileInfo, Options} from 'jscodeshift';

import {transformButtonPropsCore} from '../src/button/buttonPropsToMuiCore';

function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Check if file uses Button or LinkButton
  const buttonImports = root.find(j.ImportDeclaration, {
    source: {value: '@code-dot-org/component-library/button'},
  });

  if (buttonImports.length === 0) {
    return file.source; // No changes needed
  }

  let hasButton = false;
  let hasLinkButton = false;
  let hasButtonColors = false;

  // Step 1: Update imports
  buttonImports.forEach(path => {
    const specifiers = path.value.specifiers || [];

    hasButton = specifiers.some((s: any) => s.imported?.name === 'Button');
    hasLinkButton = specifiers.some(
      (s: any) => s.imported?.name === 'LinkButton',
    );
    hasButtonColors = specifiers.some(
      (s: any) => s.imported?.name === 'buttonColors',
    );

    const newSpecifiers: any[] = [];

    // Keep buttonColors if it exists
    if (hasButtonColors) {
      newSpecifiers.push(
        specifiers.find((s: any) => s.imported?.name === 'buttonColors'),
      );
    }

    // Replace or remove the import
    if (newSpecifiers.length > 0) {
      path.replace(j.importDeclaration(newSpecifiers, path.value.source));
    } else {
      j(path).remove();
    }
  });

  // Add MUI imports if Button or LinkButton was found
  if (hasButton || hasLinkButton) {
    const existingMuiImport = root.find(j.ImportDeclaration, {
      source: {value: '@mui/material'},
    });

    if (existingMuiImport.length === 0) {
      const muiImports = j.importDeclaration(
        [
          j.importSpecifier(j.identifier('Button'), j.identifier('MuiButton')),
          j.importSpecifier(
            j.identifier('IconButton'),
            j.identifier('MuiIconButton'),
          ),
        ],
        j.literal('@mui/material'),
      );

      const allImports = root.find(j.ImportDeclaration);
      if (allImports.length > 0) {
        allImports.at(-1).get().insertAfter(muiImports);
      } else {
        root.get().node.program.body.unshift(muiImports);
      }
    }
  }

  // Add FontAwesomeV6Icon import if needed for icons
  const needsIconImport = hasButton || hasLinkButton;
  if (needsIconImport) {
    const existingIconImport = root.find(j.ImportDeclaration, {
      source: {value: '@code-dot-org/component-library/fontAwesomeV6Icon'},
    });

    if (existingIconImport.length === 0) {
      const iconImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('FontAwesomeV6Icon'))],
        j.literal('@code-dot-org/component-library/fontAwesomeV6Icon'),
      );

      const allImports = root.find(j.ImportDeclaration);
      if (allImports.length > 0) {
        allImports.at(-1).get().insertAfter(iconImport);
      } else {
        root.get().node.program.body.unshift(iconImport);
      }
    }
  }

  // Helper to extract prop value from JSX attribute
  const getPropValue = (attr: any) => {
    if (!attr.value) return null;
    if (attr.value.type === 'JSXExpressionContainer') {
      return attr.value.expression;
    }
    return attr.value;
  };

  // Helper to evaluate expression to get runtime value (for buttonPropsToMui)
  const evaluateExpression = (expr: unknown): unknown => {
    if (!expr || typeof expr !== 'object') return undefined;
    const node = expr as {type?: string; [key: string]: unknown};

    if (node.type === 'Literal' || node.type === 'StringLiteral') {
      return (node as any).value;
    }
    if (node.type === 'BooleanLiteral') {
      return (node as any).value;
    }
    if (node.type === 'MemberExpression') {
      const obj = (node as any).object;
      const prop = (node as any).property;
      if (obj?.name === 'buttonColors') {
        return prop?.name;
      }
      return undefined;
    }
    if (node.type === 'ObjectExpression') {
      const obj: Record<string, unknown> = {};
      (node as any).properties.forEach((prop: any) => {
        if (prop.key?.name) {
          const value = prop.value;
          if (value.type === 'Literal' || value.type === 'StringLiteral') {
            obj[prop.key.name] = value.value;
          } else if (value.type === 'BooleanLiteral') {
            obj[prop.key.name] = value.value;
          }
        }
      });
      return Object.keys(obj).length > 0 ? obj : undefined;
    }
    if (
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionExpression'
    ) {
      return expr;
    }
    return undefined;
  };

  // Helper to create JSX attribute value - wraps expressions in JSXExpressionContainer
  const createJSXAttributeValue = (value: any) => {
    if (!value) return null;
    if (
      value.type === 'Literal' ||
      value.type === 'StringLiteral' ||
      value.type === 'BooleanLiteral'
    ) {
      return value;
    }
    if (value.type === 'JSXExpressionContainer') {
      return value;
    }
    return j.jsxExpressionContainer(value);
  };

  // Helper to create FontAwesomeV6Icon JSX element
  const createIconElement = (
    iconProps:
      | {
          iconName?: string;
          iconStyle?: string;
          animationType?: string;
        }
      | null
      | undefined,
  ) => {
    if (!iconProps) return null;

    const iconObjectProps: {
      type: string;
      key: any;
      value: any;
      kind: 'init';
    }[] = [];
    if (iconProps.iconName !== undefined) {
      iconObjectProps.push(
        j.property(
          'init',
          j.identifier('iconName'),
          j.literal(iconProps.iconName),
        ),
      );
    }
    if (iconProps.iconStyle !== undefined) {
      iconObjectProps.push(
        j.property(
          'init',
          j.identifier('iconStyle'),
          j.literal(iconProps.iconStyle),
        ),
      );
    }
    if (iconProps.animationType !== undefined) {
      iconObjectProps.push(
        j.property(
          'init',
          j.identifier('animationType'),
          j.literal(iconProps.animationType),
        ),
      );
    }

    return j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier('FontAwesomeV6Icon'),
        [j.jsxSpreadAttribute(j.objectExpression(iconObjectProps))],
        true,
      ),
      null,
      [],
    );
  };

  // Transform props using shared core logic
  const transformProps = (props: any[]) => {
    const propsObj: Record<string, unknown> = {};
    const originalPropsMap: Record<string, {value: unknown; attr: any}> = {};

    props.forEach(attr => {
      if (attr.type === 'JSXSpreadAttribute') {
        return;
      }

      const key = attr.name?.name;
      if (!key) return;

      const value = getPropValue(attr);
      const evaluatedValue = evaluateExpression(value);

      originalPropsMap[key] = {value, attr};

      if (evaluatedValue !== undefined) {
        propsObj[key] = evaluatedValue;
      } else if (value) {
        if (value.type === 'ObjectExpression') {
          const objValue = evaluateExpression(value);
          if (objValue) {
            propsObj[key] = objValue;
          }
        } else if (
          value.type === 'ArrowFunctionExpression' ||
          value.type === 'FunctionExpression'
        ) {
          // skip, handled by onClick logic
        } else {
          propsObj[key] = undefined;
        }
      } else if (attr.value === null) {
        propsObj[key] = true;
      }
    });

    // Ensure link buttons are marked as such
    const isLinkButton = props.some(attr => attr.name?.name === 'href');
    if (isLinkButton && !propsObj.useAsLink) {
      propsObj.useAsLink = true;
    }

    const core = transformButtonPropsCore(props as any);

    const isIconButton = !!(
      (propsObj as any).isIconOnly && (propsObj as any).icon
    );
    const isPending = !!(propsObj as any).isPending;
    const baseProps = {...core.baseProps} as Record<string, unknown>;

    const muiProps: Record<string, unknown> = {...baseProps};

    const iconLeft = (propsObj as any).iconLeft;
    const iconRight = (propsObj as any).iconRight;
    const icon = (propsObj as any).icon;
    const spinnerIcon = core.spinnerIcon;
    const spinnerPosition = core.spinnerPosition;
    const addPendingButtonWithHiddenTextClass =
      core.addPendingButtonWithHiddenTextClass;

    let iconOnlyIcon:
      | {iconName: string; iconStyle?: string; animationType?: string}
      | undefined;

    if (!isIconButton) {
      if (isPending) {
        if (addPendingButtonWithHiddenTextClass) {
          // Pending with only text: spinner centered, text hidden
          muiProps.startIcon = spinnerIcon;
          muiProps._pendingWithHiddenText = true;
        } else {
          if (spinnerPosition === 'left') {
            muiProps.startIcon = spinnerIcon;
          }
          if (iconRight && iconLeft) {
            muiProps.endIcon = iconRight;
          } else if (spinnerPosition === 'right') {
            muiProps.endIcon = spinnerIcon;
          }
        }
      } else {
        if (iconLeft) {
          muiProps.startIcon = iconLeft;
        }
        if (iconRight) {
          muiProps.endIcon = iconRight;
        }
      }

      if (propsObj.text) {
        if (addPendingButtonWithHiddenTextClass) {
          muiProps.children = propsObj.text;
          muiProps._hiddenText = true;
        } else {
          muiProps.children = propsObj.text;
        }
      }

      if (addPendingButtonWithHiddenTextClass) {
        const existingClassName = (muiProps.className as string) || '';
        muiProps.className = existingClassName
          ? `${existingClassName} buttonPendingWithHiddenText`
          : 'buttonPendingWithHiddenText';
      }
    } else if (icon) {
      iconOnlyIcon = icon;
    }

    return {
      isIconButton,
      buttonProps: isIconButton ? {} : muiProps,
      iconButtonProps: isIconButton ? muiProps : {},
      isPending,
      icon: iconOnlyIcon,
      _originalPropsMap: originalPropsMap,
      _originalProps: props,
    };
  };

  // Convert buttonPropsToMui result to JSX attributes
  const propsToJSXAttributes = (muiProps: any, originalProps: any[]) => {
    const jsxAttributes: any[] = [];

    // variant / color / size / disabled
    if (muiProps.variant) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('variant'), j.literal(muiProps.variant)),
      );
    }
    if (muiProps.color) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('color'), j.literal(muiProps.color)),
      );
    }
    if (muiProps.size) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('size'), j.literal(muiProps.size)),
      );
    }
    if (muiProps.disabled) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('disabled'), j.literal(true)),
      );
    }

    // className + force-hover + pending class
    const classNameAttr = originalProps.find(p => p.name?.name === 'className');
    const forceHoverAttr = originalProps.find(
      p => p.name?.name === 'forceHover',
    );
    const pendingWithHiddenText = muiProps._pendingWithHiddenText;

    if (classNameAttr || forceHoverAttr || pendingWithHiddenText) {
      let classNameExpr = classNameAttr
        ? getPropValue(classNameAttr)
        : j.literal('');
      let needsTemplateLiteral = false;
      const suffixParts: string[] = [];

      if (forceHoverAttr) {
        suffixParts.push(' force-hover');
        needsTemplateLiteral = true;
      }
      if (pendingWithHiddenText) {
        suffixParts.push(' buttonPendingWithHiddenText');
        needsTemplateLiteral = true;
      }

      if (needsTemplateLiteral) {
        const suffix = suffixParts.join('');
        const templateLiteral = j.templateLiteral(
          [
            j.templateElement({raw: '', cooked: ''}, false),
            j.templateElement({raw: suffix, cooked: suffix}, true),
          ],
          [classNameExpr],
        );
        const trimCall = j.callExpression(
          j.memberExpression(templateLiteral, j.identifier('trim')),
          [],
        );
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('className'),
            j.jsxExpressionContainer(trimCall),
          ),
        );
      } else if (classNameAttr) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('className'),
            createJSXAttributeValue(getPropValue(classNameAttr)),
          ),
        );
      }
    }

    // id
    if (muiProps.id !== undefined) {
      const idAttr = originalProps.find(p => p.name?.name === 'id');
      if (idAttr) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('id'),
            createJSXAttributeValue(getPropValue(idAttr)),
          ),
        );
      }
    }

    // onClick + analytics
    const onClickAttr = originalProps.find(p => p.name?.name === 'onClick');
    const analyticsCallbackAttr = originalProps.find(
      p => p.name?.name === 'analyticsCallback',
    );
    if (analyticsCallbackAttr && onClickAttr) {
      const analyticsCallbackExpr = getPropValue(analyticsCallbackAttr);
      const onClickExpr = getPropValue(onClickAttr);
      const arrowFunc = j.arrowFunctionExpression(
        [j.identifier('event')],
        j.blockStatement([
          j.expressionStatement(j.callExpression(analyticsCallbackExpr, [])),
          onClickExpr
            ? j.expressionStatement(
                j.conditionalExpression(
                  onClickExpr,
                  j.callExpression(onClickExpr, [j.identifier('event')]),
                  j.nullLiteral(),
                ),
              )
            : j.emptyStatement(),
        ]),
      );
      jsxAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('onClick'),
          j.jsxExpressionContainer(arrowFunc),
        ),
      );
    } else if (onClickAttr) {
      jsxAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('onClick'),
          createJSXAttributeValue(getPropValue(onClickAttr)),
        ),
      );
    }

    // aria-label
    const ariaLabelAttr = originalProps.find(
      p => p.name?.name === 'ariaLabel' || p.name?.name === 'aria-label',
    );
    if (ariaLabelAttr) {
      jsxAttributes.push(
        j.jsxAttribute(
          j.jsxIdentifier('aria-label'),
          createJSXAttributeValue(getPropValue(ariaLabelAttr)),
        ),
      );
    }

    // data-force-hover
    if (muiProps['data-force-hover']) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('data-force-hover'), j.literal(true)),
      );
    }

    // link props (href/target/download/title/rel)
    const hrefAttr = originalProps.find(p => p.name?.name === 'href');
    if (hrefAttr) {
      const disabledAttr = originalProps.find(p => p.name?.name === 'disabled');
      const isDisabled =
        disabledAttr &&
        (disabledAttr.value === null ||
          (disabledAttr.value &&
            disabledAttr.value.type === 'Literal' &&
            disabledAttr.value.value === true));
      if (!isDisabled) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('href'),
            createJSXAttributeValue(getPropValue(hrefAttr)),
          ),
        );
      }
    }

    if (muiProps.target !== undefined) {
      const targetAttr = originalProps.find(p => p.name?.name === 'target');
      if (targetAttr) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('target'),
            createJSXAttributeValue(getPropValue(targetAttr)),
          ),
        );
      }
    }

    if (muiProps.download !== undefined) {
      const downloadAttr = originalProps.find(p => p.name?.name === 'download');
      if (downloadAttr) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('download'),
            createJSXAttributeValue(getPropValue(downloadAttr)),
          ),
        );
      }
    }

    if (muiProps.title !== undefined) {
      const titleAttr = originalProps.find(p => p.name?.name === 'title');
      if (titleAttr) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('title'),
            createJSXAttributeValue(getPropValue(titleAttr)),
          ),
        );
      }
    }

    if (muiProps.rel !== undefined) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('rel'), j.literal(muiProps.rel)),
      );
    }

    // type
    if (muiProps.type !== undefined && !muiProps.href) {
      jsxAttributes.push(
        j.jsxAttribute(j.jsxIdentifier('type'), j.literal(muiProps.type)),
      );
    }

    // icons & children
    const children: any[] = [];

    // startIcon
    if (muiProps.startIcon) {
      const iconProps = muiProps.startIcon;
      const iconLeftAttr = originalProps.find(p => p.name?.name === 'iconLeft');
      const isSpinner = iconProps.iconName === 'spinner';
      let iconJSX = null;

      if (isSpinner) {
        iconJSX = createIconElement({
          iconName: 'spinner',
          iconStyle: 'solid',
          animationType: 'spin',
        });
      } else if (iconLeftAttr) {
        const iconValue = getPropValue(iconLeftAttr);
        iconJSX = createIconElement(iconValue);
      } else if (typeof iconProps === 'object' && iconProps.iconName) {
        iconJSX = createIconElement(iconProps);
      }

      if (iconJSX) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('startIcon'),
            j.jsxExpressionContainer(iconJSX),
          ),
        );
      }
    }

    // endIcon
    if (muiProps.endIcon) {
      const iconProps = muiProps.endIcon;
      const iconRightAttr = originalProps.find(
        p => p.name?.name === 'iconRight',
      );
      const isSpinner = iconProps.iconName === 'spinner';
      let iconJSX = null;

      if (isSpinner) {
        iconJSX = createIconElement({
          iconName: 'spinner',
          iconStyle: 'solid',
          animationType: 'spin',
        });
      } else if (iconRightAttr) {
        const iconValue = getPropValue(iconRightAttr);
        iconJSX = createIconElement(iconValue);
      } else if (typeof iconProps === 'object' && iconProps.iconName) {
        iconJSX = createIconElement(iconProps);
      }

      if (iconJSX) {
        jsxAttributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('endIcon'),
            j.jsxExpressionContainer(iconJSX),
          ),
        );
      }
    }

    // text / children
    const textAttr = originalProps.find(p => p.name?.name === 'text');
    if (textAttr) {
      const textValue = getPropValue(textAttr);
      if (textValue) {
        const textChild =
          textValue.type === 'JSXElement' ||
          textValue.type === 'JSFragment' ||
          textValue.type === 'Literal'
            ? textValue
            : j.jsxExpressionContainer(textValue);

        if (muiProps._hiddenText) {
          const hiddenSpan = j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier('span'),
              [
                j.jsxAttribute(
                  j.jsxIdentifier('style'),
                  j.jsxExpressionContainer(
                    j.objectExpression([
                      j.property(
                        'init',
                        j.identifier('visibility'),
                        j.literal('hidden'),
                      ),
                    ]),
                  ),
                ),
              ],
              false,
            ),
            j.jsxClosingElement(j.jsxIdentifier('span')),
            [textChild],
          );
          children.push(hiddenSpan);
        } else {
          children.push(textChild);
        }
      }
    }

    return {jsxAttributes, children};
  };

  // Step 2: Transform Button/LinkButton JSX elements
  const transformButton = (path: any) => {
    const element = path.value;
    const openingElement = element.openingElement;
    const props = openingElement.attributes || [];

    const {
      isIconButton,
      buttonProps,
      iconButtonProps,
      icon: iconOnlyIcon,
    } = transformProps(props);

    const muiProps = isIconButton ? iconButtonProps : buttonProps;

    const {jsxAttributes, children: muiChildren} = propsToJSXAttributes(
      muiProps,
      props,
    );

    // Icon-only buttons: render icon as child
    if (isIconButton && iconOnlyIcon) {
      const iconAttr = props.find((p: any) => p.name?.name === 'icon');
      if (iconAttr) {
        const iconValue = getPropValue(iconAttr);
        const iconElement = createIconElement(iconValue);
        if (iconElement) {
          muiChildren.push(iconElement);
        }
      }
    }

    const componentName = isIconButton ? 'MuiIconButton' : 'MuiButton';

    const hasStartIcon = jsxAttributes.some(
      (a: any) => a.name?.name === 'startIcon',
    );
    const hasEndIcon = jsxAttributes.some(
      (a: any) => a.name?.name === 'endIcon',
    );
    const hasText = props.some((p: any) => p.name?.name === 'text');
    const hasChildren =
      muiChildren.length > 0 ||
      hasStartIcon ||
      hasEndIcon ||
      hasText ||
      (element.children && element.children.length > 0);

    return j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(componentName),
        jsxAttributes,
        !hasChildren,
      ),
      hasChildren ? j.jsxClosingElement(j.jsxIdentifier(componentName)) : null,
      hasChildren ? muiChildren : [],
    );
  };

  root
    .find(j.JSXElement, {
      openingElement: {name: {name: 'Button'}},
    })
    .replaceWith(transformButton);

  root
    .find(j.JSXElement, {
      openingElement: {name: {name: 'LinkButton'}},
    })
    .replaceWith(transformButton);

  return root.toSource({
    quote: 'single',
    trailingComma: true,
    lineTerminator: '\n',
  });
}

export default transformer;
