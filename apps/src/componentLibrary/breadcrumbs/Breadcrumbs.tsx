import classNames from 'classnames';
import uniq from 'lodash/uniq';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import BreadCrumb from './_Breadcrumb';

import moduleStyles from './breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  /** Breadcrumbs group label */
  label?: string;
  /** Breadcrumbs group name */
  name: string;
  /** Breadcrumbs required state */
  required?: boolean;
  /** Breadcrumbs disabled state */
  disabled?: boolean;
  /** Breadcrumbs text type (thickness) */
  textThickness?: 'thick' | 'thin';
  /** List of Breadcrumbs to render */
  options: {value: string; label: string}[];
  /** List of selected Breadcrumbs values */
  values: string[];
  /** Callback to update selected Breadcrumbs values */
  setValues: (values: string[]) => void;
  /** Breadcrumbs color */
  color?: 'black' | 'gray';
  /** Size of Breadcrumbs */
  size?: ComponentSizeXSToL;
  /** Custom className */
  className?: string;
}

// TODO:
// * MARKUP
// * styles
// * add stories
// * add tests
// * cleanup
// * update README

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/BreadcrumbsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Breadcrumbs Component.
 * Can be used to render Breadcrumbs or as a part of bigger/more complex components (e.g. forms).
 */
const Breadcrumbs: React.FunctionComponent<BreadcrumbsProps> = ({
  label,
  name,
  required,
  disabled,
  options,
  values,
  setValues,
  textThickness = 'thin',
  color = 'black',
  size = 'm',
  className,
}) => {
  // NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
  // natively understands it as an array. Set `required` to `true` if you want
  // the user to have to select at least one of the options to proceed.
  // You probably want `values` to start out as an empty array.
  const inputName = `${name}[]`;

  return (
    <div
      className={classNames(
        moduleStyles.chips,
        moduleStyles[`chips-${color}`],
        moduleStyles[`chips-${size}`],
        className
      )}
      data-testid={`chips-${name}`}
    >
      <fieldset>
        {label && <label className={moduleStyles.groupLabel}>{label}</label>}

        <div className={moduleStyles.chipsContainer}>
          {options.map(option => (
            <BreadCrumb
              label={option.label}
              name={inputName}
              value={option.value}
              key={option.value}
              textThickness={textThickness}
              checked={values.includes(option.value)}
              // The child's `required` prop will be set to `false` if the
              // Group's `required` prop is falsy. It will be set to `true` if
              // the Group's `required` prop is truthy AND none of the options
              // are `checked`, or `false` if at least one of the options is
              // `checked`.
              required={required ? values.length === 0 : false}
              disabled={disabled}
              onCheckedChange={checked => {
                if (checked) {
                  // Add this value to the `values` array.
                  setValues(uniq([...values, option.value]));
                } else {
                  // Remove this value from the `values` array.
                  setValues(values.filter(v => v !== option.value));
                }
              }}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default Breadcrumbs;
