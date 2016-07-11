/**
 * Code.org custom react proptypes.
 */
import React from 'react';

/**
 * A custom React PropType to ensure that the specified
 * component types are given in the specified order
 * as children of the component that this prop type is used on.
 *
 * Example:
 *   propTypes: {
 *     children: childrenOfType([Heading, Body])
 *   }
 *
 * In this example, the prop type does not validate if there are more than
 * one <Heading> components in the children or if <Heading> comes after <Body>.
 * However, the prop type will be valid if you omit <Heading> and/or <Body>.
 *
 * @param ...validChildrenTypes array<constructor> - a list of types to allow as children
 */
export function childrenOfType(...validChildrenTypes) {
  return function (props, propName, componentName) {
    if (propName !== 'children') {
      return new Error(
        'The childrenOfType prop type should only be used on the children prop.'
      );
    }
    const prop = props[propName];
    const actualChildrenTypes = React.Children.map(prop, el => el.type);
    let error;
    let typeIndex = -1;
    actualChildrenTypes.forEach((childType, index) => {
      if (error) {
        return;
      }
      typeIndex++;
      while (childType !== validChildrenTypes[typeIndex]) {
        if (typeIndex < validChildrenTypes.length - 1) {
          typeIndex++;
        } else {
          error = new Error(
            componentName +
            ' was given children of types ' +
            actualChildrenTypes.map(t => `<${t.name}>`).join(', ') +
            ' but only accepts one of each child in the following order: ' +
            validChildrenTypes.map(t => `<${t.name}>`).join(', ') + '.'
          );
          break;
        }
      }
    });
    return error;
  };
}

/**
 * A custom React PropType for a prop that can only be specified
 * when a child node of the corresponding type has not been specified.
 * This is useful for having an API where your component accepts "configuration"
 * either in the form of a prop, or as a child node. For example, to allow for:
 *
 * <IconButton>
 *   <Icon src="/images/icons/cow.png"/>
 *   Click the cow!
 * </IconButton>
 *
 * --- or ---
 *
 * <IconButton icon="/images/icons/cow.png">Click the cow!</IconButton>
 *
 * Why would you want to do this? It allows callsites to use non-default Icon
 * components if they want. Like so:
 *
 * <IconButton>
 *   <AnimatedIcon animation="spin" svg="/images/icons/cow.svg"/>
 *   Click the cow!
 * </IconButton>
 *
 * Example:
 *
 *   propTypes: {
 *     children: whenNoChildOfTypes(Icon, AnimatedIcon)
 *   }
 *
 */
export function whenNoChildOfTypes(...unexpectedChildTypes) {
  return function (props, propName, componentName) {
    if (!props.children || !props[propName]) {
      return;
    }
    let error;
    const actualChildrenTypes = React.Children.map(props['children'], el => el.type);
    for (const childType of actualChildrenTypes) {
      if (unexpectedChildTypes.includes(childType)) {
        error = new Error(
          `${componentName} was given a ${propName} prop and a ` +
          `<${childType.name}> child, but only one of those is allowed.`
        );
        break;
      }
    }
    return error;
  };
}
