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
