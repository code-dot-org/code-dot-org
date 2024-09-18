import classnames from 'classnames';
import React, {ChangeEvent, HTMLAttributes} from 'react';

import {componentSizeToBodyTextSizeMap} from '@cdo/apps/componentLibrary/common/constants';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import Typography from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './slider.module.scss';

export interface SliderProps extends HTMLAttributes<HTMLInputElement> {
  /** Slider onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** Slider label */
  label?: string;
  /** Is Slider disabled */
  disabled?: boolean;
  /** Size of Slider */
  size?: ComponentSizeXSToL;
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
 * * (see apps/test/unit/componentLibrary/SliderTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Slider Component.
 * Can be used to render a slider or as a part of bigger/more complex components (e.g. some forms).
 */
const Slider: React.FunctionComponent<SliderProps> = ({
  label,
  onChange,
  name,
  value,
  disabled = false,
  size = 'm',
  ...HTMLAttributes
}) => {
  const bodyTextSize = componentSizeToBodyTextSizeMap[size];

  return (
    <label
      className={classnames(moduleStyles.label, moduleStyles[`label-${size}`])}
    >
      {label && (
        <Typography semanticTag="span" visualAppearance={bodyTextSize}>
          {label}
        </Typography>
      )}
      <input
        type="range"
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...HTMLAttributes}
      />
    </label>
  );
};

export default Slider;
