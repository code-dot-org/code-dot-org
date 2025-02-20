import classNames from 'classnames';
import {pick} from 'lodash';
import React, {ReactNode, LabelHTMLAttributes, useMemo} from 'react';

import {componentSizes} from '@/common/constants';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './label.module.scss';

export const labelColors = {
  black: 'black',
  gray: 'gray',
  white: 'white',
} as const;

export const labelSizes = pick(componentSizes, [
  componentSizes.s,
  componentSizes.m,
  componentSizes.l,
]);

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Label children */
  children?: ReactNode;
  /** Label text */
  text?: ReactNode;
  /** Label color */
  color?: (typeof labelColors)[keyof typeof labelColors];
  /** Label size */
  size?: (typeof labelSizes)[keyof typeof labelSizes];
  /** Label helper section data */
  helper?: {
    icon?: FontAwesomeV6IconProps;
    text?: ReactNode;
  };
  /** Label error message */
  error?: ReactNode;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Label.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Label Component.
 * Used to render a field label.
 */
const Label: React.FunctionComponent<LabelProps> = ({
  children,
  text,
  error,
  helper,
  color = labelColors.black,
  size = labelSizes.m,
  ...HTMLAttrs
}) => {
  const helperSection = useMemo(() => {
    const classes = [moduleStyles.labelHelperSection];
    let icon = helper?.icon;
    let text = helper?.text;

    if (error) {
      classes.push(moduleStyles.labelErrorSection);
      icon = {iconName: 'circle-exclamation'};
      text = error;
    }

    if (!icon && !text) return;

    return (
      <div className={classNames(classes)}>
        {icon && <FontAwesomeV6Icon {...icon}/>}
        {text && <span>{text}</span>}
      </div>
    );
  }, [helper, error]);

  return (
    <label
      {...HTMLAttrs}
      className={classNames(
        moduleStyles.label,
        moduleStyles[`label-${color}`],
        moduleStyles[`label-${size}`],
        HTMLAttrs.className,
      )}
    >
      {text && <span className={moduleStyles.labelText}>{text}</span>}

      {children}

      {helperSection}
    </label>
  );
};

export default Label;
