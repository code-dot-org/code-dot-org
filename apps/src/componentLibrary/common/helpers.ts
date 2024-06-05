import {AriaAttributes} from 'react';

type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

export const getAriaPropsFromProps = (props: {
  [key: string]: PrimitiveValue;
}) => {
  const ariaProps: {[key: string]: PrimitiveValue} = {};
  Object.keys(props).forEach(key => {
    if (key.startsWith('aria-')) {
      ariaProps[key] = props[key];
    }
  });

  return ariaProps as AriaAttributes;
};
