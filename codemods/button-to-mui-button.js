/**
 * Codemod to transform Button/LinkButton components to MUI Button/IconButton
 * 
 * Usage:
 * npx jscodeshift -t codemods/button-to-mui-button.js apps/src/templates/curriculumCatalog/*.jsx
 * 
 * This codemod uses buttonPropsToMuiHelper to transform props and renders MUI components directly.
 */

const {buttonPropsToMui} = require('./buttonPropsToMuiHelper');

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Check if file uses Button or LinkButton
  const buttonImports = root.find(j.ImportDeclaration, {
    source: {value: '@code-dot-org/component-library/button'}
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
    
    hasButton = specifiers.some(s => s.imported?.name === 'Button');
    hasLinkButton = specifiers.some(s => s.imported?.name === 'LinkButton');
    hasButtonColors = specifiers.some(s => s.imported?.name === 'buttonColors');
    
    const newSpecifiers = [];
    
    // Keep buttonColors if it exists
    if (hasButtonColors) {
      newSpecifiers.push(specifiers.find(s => s.imported?.name === 'buttonColors'));
    }
    
    // Replace or remove the import
    if (newSpecifiers.length > 0) {
      path.replace(
        j.importDeclaration(newSpecifiers, path.value.source)
      );
    } else {
      j(path).remove();
    }
  });

  // Add MUI imports if Button or LinkButton was found
  if (hasButton || hasLinkButton) {
    const existingMuiImport = root.find(j.ImportDeclaration, {
      source: {value: '@mui/material'}
    });
    
    if (existingMuiImport.length === 0) {
      const muiImports = j.importDeclaration(
        [
          j.importSpecifier(j.identifier('Button'), j.identifier('MuiButton')),
          j.importSpecifier(j.identifier('IconButton'), j.identifier('MuiIconButton'))
        ],
        j.literal('@mui/material')
      );
      
      // Find the last import to insert after
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
      source: {value: '@code-dot-org/component-library/fontAwesomeV6Icon'}
    });
    
    if (existingIconImport.length === 0) {
      const iconImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('FontAwesomeV6Icon'))],
        j.literal('@code-dot-org/component-library/fontAwesomeV6Icon')
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
  const getPropValue = (attr) => {
    if (!attr.value) return null;
    if (attr.value.type === 'JSXExpressionContainer') {
      return attr.value.expression;
    }
    return attr.value;
  };

  // Helper to get string literal value
  const getStringValue = (value) => {
    if (value && value.type === 'Literal') return value.value;
    if (value && value.type === 'StringLiteral') return value.value;
    return null;
  };

  // Helper to evaluate expression to get runtime value (for buttonPropsToMui)
  const evaluateExpression = (expr) => {
    if (!expr) return undefined;
    if (expr.type === 'Literal' || expr.type === 'StringLiteral') {
      return expr.value;
    }
    if (expr.type === 'BooleanLiteral') {
      return expr.value;
    }
    if (expr.type === 'MemberExpression') {
      // Handle buttonColors.purple, etc.
      if (expr.object?.name === 'buttonColors') {
        return expr.property?.name; // Return 'purple', 'black', etc.
      }
      // For other member expressions, we can't evaluate at codemod time
      return undefined;
    }
    if (expr.type === 'ObjectExpression') {
      // Extract object properties
      const obj = {};
      expr.properties.forEach(prop => {
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
    if (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') {
      return expr; // Keep function as-is (but buttonPropsToMui can't use it)
    }
    // For other expressions, return undefined (will be handled differently)
    return undefined;
  };

  // Helper to create JSX attribute value - wraps expressions in JSXExpressionContainer
  const createJSXAttributeValue = (value) => {
    if (!value) return null;
    // If it's already a literal, return as-is
    if (value.type === 'Literal' || value.type === 'StringLiteral' || value.type === 'BooleanLiteral') {
      return value;
    }
    // If it's already a JSXExpressionContainer, return as-is
    if (value.type === 'JSXExpressionContainer') {
      return value;
    }
    // Otherwise, wrap in JSXExpressionContainer
    return j.jsxExpressionContainer(value);
  };

  // Helper to create FontAwesomeV6Icon JSX element
  const createIconElement = (iconProps) => {
    if (!iconProps) return null;
    
    const iconAttributes = [];
    
    // iconProps can be an object with iconName, iconStyle, animationType
    if (iconProps.iconName) {
      iconAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('iconName'),
        j.literal(iconProps.iconName)
      ));
    }
    if (iconProps.iconStyle) {
      iconAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('iconStyle'),
        j.literal(iconProps.iconStyle)
      ));
    }
    if (iconProps.animationType) {
      iconAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('animationType'),
        j.literal(iconProps.animationType)
      ));
    }
    
    // If iconProps is already a JSX expression (object literal), use it directly
    if (iconProps.type && iconProps.type !== 'ObjectExpression') {
      return j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('FontAwesomeV6Icon'), iconAttributes, true),
        null,
        []
      );
    }
    
    // Otherwise, create from object expression
    const iconObjectProps = [];
    if (iconProps.iconName !== undefined) {
      iconObjectProps.push(j.property('init', j.identifier('iconName'), j.literal(iconProps.iconName)));
    }
    if (iconProps.iconStyle !== undefined) {
      iconObjectProps.push(j.property('init', j.identifier('iconStyle'), j.literal(iconProps.iconStyle)));
    }
    if (iconProps.animationType !== undefined) {
      iconObjectProps.push(j.property('init', j.identifier('animationType'), j.literal(iconProps.animationType)));
    }
    
    return j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier('FontAwesomeV6Icon'),
        [j.jsxSpreadAttribute(j.objectExpression(iconObjectProps))],
        true
      ),
      null,
      []
    );
  };

  // Transform props using buttonPropsToMui
  const transformProps = (props) => {
    // Extract props as plain object for buttonPropsToMui
    const propsObj = {};
    const originalPropsMap = {}; // Store original AST nodes for later use
    
    props.forEach(attr => {
      if (attr.type === 'JSXSpreadAttribute') {
        // Can't handle spread attributes in codemod - skip for now
        return;
      }
      
      const key = attr.name?.name;
      if (!key) return;
      
      const value = getPropValue(attr);
      const evaluatedValue = evaluateExpression(value);
      
      // Store original value for later use
      originalPropsMap[key] = {value, attr};
      
      // Store both evaluated and original value
      if (evaluatedValue !== undefined) {
        propsObj[key] = evaluatedValue;
      } else if (value) {
        // For object expressions (like icon objects), try to extract
        if (value.type === 'ObjectExpression') {
          const objValue = evaluateExpression(value);
          if (objValue) {
            propsObj[key] = objValue;
          }
        } else if (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') {
          // Can't evaluate functions, but buttonPropsToMui will handle onClick
          // We'll handle this separately
        } else {
          // For other expressions, we can't evaluate at codemod time
          // Store a placeholder
          propsObj[key] = undefined;
        }
      } else if (attr.value === null) {
        // Boolean attribute
        propsObj[key] = true;
      }
    });
    
    // Check if it's a LinkButton (has href)
    const isLinkButton = props.some(attr => attr.name?.name === 'href');
    if (isLinkButton && !propsObj.useAsLink) {
      propsObj.useAsLink = true;
    }
    
    // Call buttonPropsToMui
    const result = buttonPropsToMui(propsObj);
    
    // Store original props map for later use
    result._originalPropsMap = originalPropsMap;
    result._originalProps = props;
    
    return result;
  };

  // Convert buttonPropsToMui result to JSX attributes
  const propsToJSXAttributes = (muiProps, originalProps) => {
    const jsxAttributes = [];
    
    // Add variant
    if (muiProps.variant) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('variant'),
        j.literal(muiProps.variant)
      ));
    }
    
    // Add color
    if (muiProps.color) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('color'),
        j.literal(muiProps.color)
      ));
    }
    
    // Add size
    if (muiProps.size) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('size'),
        j.literal(muiProps.size)
      ));
    }
    
    // Add disabled
    if (muiProps.disabled) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('disabled'),
        j.literal(true)
      ));
    }
    
    // Add className (always check original props and combine with forceHover/pendingWithHiddenText)
    const classNameAttr = originalProps.find(p => p.name?.name === 'className');
    const forceHoverAttr = originalProps.find(p => p.name?.name === 'forceHover');
    const pendingWithHiddenText = muiProps._pendingWithHiddenText;
    
    if (classNameAttr || forceHoverAttr || pendingWithHiddenText) {
      let classNameExpr = classNameAttr ? getPropValue(classNameAttr) : j.literal('');
      let needsTemplateLiteral = false;
      let suffixParts = [];
      
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
            j.templateElement({raw: suffix, cooked: suffix}, true)
          ],
          [classNameExpr]
        );
        const trimCall = j.callExpression(
          j.memberExpression(templateLiteral, j.identifier('trim')),
          []
        );
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('className'),
          j.jsxExpressionContainer(trimCall)
        ));
      } else if (classNameAttr) {
        // Just className, no modifications
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('className'),
          createJSXAttributeValue(getPropValue(classNameAttr))
        ));
      }
    }
    
    // Add id
    if (muiProps.id !== undefined) {
      const idAttr = originalProps.find(p => p.name?.name === 'id');
      if (idAttr) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('id'),
          createJSXAttributeValue(getPropValue(idAttr))
        ));
      }
    }
    
    // Add onClick (always check original props)
    const onClickAttr = originalProps.find(p => p.name?.name === 'onClick');
    const analyticsCallbackAttr = originalProps.find(p => p.name?.name === 'analyticsCallback');
    
    if (analyticsCallbackAttr && onClickAttr) {
      // Create arrow function that calls both
      const analyticsCallbackExpr = getPropValue(analyticsCallbackAttr);
      const onClickExpr = getPropValue(onClickAttr);
      
      const arrowFunc = j.arrowFunctionExpression(
        [j.identifier('event')],
        j.blockStatement([
          j.expressionStatement(j.callExpression(analyticsCallbackExpr, [])),
          onClickExpr ? j.expressionStatement(
            j.conditionalExpression(
              onClickExpr,
              j.callExpression(onClickExpr, [j.identifier('event')]),
              j.nullLiteral()
            )
          ) : j.emptyStatement()
        ])
      );
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('onClick'),
        j.jsxExpressionContainer(arrowFunc)
      ));
    } else if (onClickAttr) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('onClick'),
        createJSXAttributeValue(getPropValue(onClickAttr))
      ));
    }
    
    // Add aria-label (always check original props, buttonPropsToMui may not set it if undefined)
    const ariaLabelAttr = originalProps.find(p => 
      p.name?.name === 'ariaLabel' || p.name?.name === 'aria-label'
    );
    if (ariaLabelAttr) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('aria-label'),
        createJSXAttributeValue(getPropValue(ariaLabelAttr))
      ));
    }
    
    // Add data-force-hover
    if (muiProps['data-force-hover']) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('data-force-hover'),
        j.literal(true)
      ));
    }
    
    // Add link props (always check original props for href)
    const hrefAttr = originalProps.find(p => p.name?.name === 'href');
    if (hrefAttr) {
      // Only add href if button is not disabled
      const disabledAttr = originalProps.find(p => p.name?.name === 'disabled');
      const isDisabled = disabledAttr && (
        disabledAttr.value === null || 
        (disabledAttr.value && disabledAttr.value.type === 'Literal' && disabledAttr.value.value === true)
      );
      if (!isDisabled) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('href'),
          createJSXAttributeValue(getPropValue(hrefAttr))
        ));
      }
    }
    
    if (muiProps.target !== undefined) {
      const targetAttr = originalProps.find(p => p.name?.name === 'target');
      if (targetAttr) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('target'),
          createJSXAttributeValue(getPropValue(targetAttr))
        ));
      }
    }
    
    if (muiProps.download !== undefined) {
      const downloadAttr = originalProps.find(p => p.name?.name === 'download');
      if (downloadAttr) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('download'),
          createJSXAttributeValue(getPropValue(downloadAttr))
        ));
      }
    }
    
    if (muiProps.title !== undefined) {
      const titleAttr = originalProps.find(p => p.name?.name === 'title');
      if (titleAttr) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('title'),
          createJSXAttributeValue(getPropValue(titleAttr))
        ));
      }
    }
    
    if (muiProps.rel !== undefined) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('rel'),
        j.literal(muiProps.rel)
      ));
    }
    
    // Add type for buttons
    if (muiProps.type !== undefined && !muiProps.href) {
      jsxAttributes.push(j.jsxAttribute(
        j.jsxIdentifier('type'),
        j.literal(muiProps.type)
      ));
    }
    
    // Handle startIcon and endIcon
    const children = [];
    
    // Add startIcon if present
    if (muiProps.startIcon) {
      const iconProps = muiProps.startIcon;
      // Check if it's from iconLeft or spinner
      const iconLeftAttr = originalProps.find(p => p.name?.name === 'iconLeft');
      const isSpinner = iconProps.iconName === 'spinner';
      
      let iconJSX = null;
      if (isSpinner) {
        // Create spinner icon
        iconJSX = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier('FontAwesomeV6Icon'),
            [
              j.jsxAttribute(j.jsxIdentifier('iconName'), j.literal('spinner')),
              j.jsxAttribute(j.jsxIdentifier('iconStyle'), j.literal('solid')),
              j.jsxAttribute(j.jsxIdentifier('animationType'), j.literal('spin'))
            ],
            true
          ),
          null,
          []
        );
      } else if (iconLeftAttr) {
        // Use original iconLeft expression
        const iconValue = getPropValue(iconLeftAttr);
        iconJSX = createIconElementFromExpression(iconValue);
      } else if (typeof iconProps === 'object' && iconProps.iconName) {
        // Create from iconProps object
        iconJSX = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier('FontAwesomeV6Icon'),
            [
              j.jsxAttribute(j.jsxIdentifier('iconName'), j.literal(iconProps.iconName)),
              j.jsxAttribute(j.jsxIdentifier('iconStyle'), j.literal(iconProps.iconStyle || 'solid')),
              ...(iconProps.animationType ? [j.jsxAttribute(j.jsxIdentifier('animationType'), j.literal(iconProps.animationType))] : [])
            ],
            true
          ),
          null,
          []
        );
      }
      
      if (iconJSX) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('startIcon'),
          j.jsxExpressionContainer(iconJSX)
        ));
      }
    }
    
    // Add endIcon if present
    if (muiProps.endIcon) {
      const iconProps = muiProps.endIcon;
      const iconRightAttr = originalProps.find(p => p.name?.name === 'iconRight');
      const isSpinner = iconProps.iconName === 'spinner';
      
      let iconJSX = null;
      if (isSpinner) {
        // Create spinner icon
        iconJSX = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier('FontAwesomeV6Icon'),
            [
              j.jsxAttribute(j.jsxIdentifier('iconName'), j.literal('spinner')),
              j.jsxAttribute(j.jsxIdentifier('iconStyle'), j.literal('solid')),
              j.jsxAttribute(j.jsxIdentifier('animationType'), j.literal('spin'))
            ],
            true
          ),
          null,
          []
        );
      } else if (iconRightAttr) {
        // Use original iconRight expression
        const iconValue = getPropValue(iconRightAttr);
        iconJSX = createIconElementFromExpression(iconValue);
      } else if (typeof iconProps === 'object' && iconProps.iconName) {
        // Create from iconProps object
        iconJSX = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier('FontAwesomeV6Icon'),
            [
              j.jsxAttribute(j.jsxIdentifier('iconName'), j.literal(iconProps.iconName)),
              j.jsxAttribute(j.jsxIdentifier('iconStyle'), j.literal(iconProps.iconStyle || 'solid')),
              ...(iconProps.animationType ? [j.jsxAttribute(j.jsxIdentifier('animationType'), j.literal(iconProps.animationType))] : [])
            ],
            true
          ),
          null,
          []
        );
      }
      
      if (iconJSX) {
        jsxAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('endIcon'),
          j.jsxExpressionContainer(iconJSX)
        ));
      }
    }
    
    // Add children (text) - always check original props for text
    const textAttr = originalProps.find(p => p.name?.name === 'text');
    if (textAttr) {
      const textValue = getPropValue(textAttr);
      if (textValue) {
        // Wrap in JSXExpressionContainer if it's not already a JSX element or text
        const textChild = (textValue.type === 'JSXElement' || textValue.type === 'JSXFragment' || textValue.type === 'Literal')
          ? textValue
          : j.jsxExpressionContainer(textValue);
        
        if (muiProps._hiddenText) {
          // Hidden text for spacing (pending state)
          const hiddenSpan = j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier('span'),
              [j.jsxAttribute(
                j.jsxIdentifier('style'),
                j.jsxExpressionContainer(j.objectExpression([
                  j.property('init', j.identifier('visibility'), j.literal('hidden'))
                ]))
              )],
              false
            ),
            j.jsxClosingElement(j.jsxIdentifier('span')),
            [textChild]
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
  const transformButton = (path) => {
    const element = path.value;
    const openingElement = element.openingElement;
    const props = openingElement.attributes || [];
    
    // Transform props using buttonPropsToMui
    const {isIconButton, buttonProps, iconButtonProps, icon: iconOnlyIcon} = transformProps(props);
    
    // Use the appropriate props
    const muiProps = isIconButton ? iconButtonProps : buttonProps;
    
    // Convert to JSX attributes
    const {jsxAttributes, children: muiChildren} = propsToJSXAttributes(muiProps, props);
    
    // Handle icon-only button icon
    if (isIconButton && iconOnlyIcon) {
      const iconAttr = props.find(p => p.name?.name === 'icon');
      if (iconAttr) {
        const iconValue = getPropValue(iconAttr);
        // Icon should be rendered as children for IconButton
        const iconElement = createIconElementFromExpression(iconValue);
        if (iconElement) {
          muiChildren.push(iconElement);
        }
      }
    }
    
    // Create the MUI component
    const componentName = isIconButton ? 'MuiIconButton' : 'MuiButton';
    
    // Determine if we need a closing tag
    // Use closing tag if there are children, startIcon, endIcon, or text
    const hasStartIcon = jsxAttributes.some(a => a.name?.name === 'startIcon');
    const hasEndIcon = jsxAttributes.some(a => a.name?.name === 'endIcon');
    const hasText = props.some(p => p.name?.name === 'text');
    const hasChildren = muiChildren.length > 0 || 
                       hasStartIcon || 
                       hasEndIcon || 
                       hasText ||
                       (element.children && element.children.length > 0);
    
    // Use closing tag when there are children or icons
    return j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(componentName),
        jsxAttributes,
        !hasChildren // self-closing if no children/icons
      ),
      hasChildren ? j.jsxClosingElement(j.jsxIdentifier(componentName)) : null,
      hasChildren ? muiChildren : []
    );
  };

  // Helper to create icon element from JSX expression
  const createIconElementFromExpression = (expr) => {
    if (!expr) return null;
    
    // If it's an object expression, extract properties
    if (expr.type === 'ObjectExpression') {
      const iconProps = {};
      expr.properties.forEach(prop => {
        if (prop.key?.name) {
          const value = prop.value;
          if (value.type === 'Literal') {
            iconProps[prop.key.name] = value.value;
          }
        }
      });
      
      const iconAttributes = [];
      if (iconProps.iconName) {
        iconAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('iconName'),
          j.literal(iconProps.iconName)
        ));
      }
      if (iconProps.iconStyle) {
        iconAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('iconStyle'),
          j.literal(iconProps.iconStyle)
        ));
      }
      if (iconProps.animationType) {
        iconAttributes.push(j.jsxAttribute(
          j.jsxIdentifier('animationType'),
          j.literal(iconProps.animationType)
        ));
      }
      
      return j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('FontAwesomeV6Icon'), iconAttributes, true),
        null,
        []
      );
    }
    
    // If it's already a JSX element, return as-is
    if (expr.type === 'JSXElement') {
      return expr;
    }
    
    return null;
  };

  // Find and replace Button elements
  root.find(j.JSXElement, {
    openingElement: {
      name: {name: 'Button'}
    }
  }).replaceWith(transformButton);

  // Find and replace LinkButton elements
  root.find(j.JSXElement, {
    openingElement: {
      name: {name: 'LinkButton'}
    }
  }).replaceWith(transformButton);

  return root.toSource({
    quote: 'single',
    trailingComma: true,
    lineTerminator: '\n'
  });
};
