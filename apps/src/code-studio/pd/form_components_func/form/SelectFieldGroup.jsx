import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import FieldGroupComponent from '../../form_components/FieldGroup';
import utils from '../../form_components/utils';
import {getValidationState, FormContext} from '../FormComponent';

/**
 * Construct a controlled Select dropdown with supplied options
 */
export const SelectFieldGroup = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name, options, placeholder} = props;
  let renderedOptions;
  if (Array.isArray(options)) {
    renderedOptions = options.map(value => {
      const {answerText, answerValue} = utils.normalizeAnswer(value);
      return (
        <option key={answerValue} value={answerValue}>
          {answerText}
        </option>
      );
    });
  } else {
    renderedOptions = Object.keys(options).map(key => (
      <option key={key} value={key}>
        {options[key]}
      </option>
    ));
  }

  return (
    <FieldGroupComponent
      key={name}
      id={name}
      componentClass="select"
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name] || ''}
      {...props}
    >
      {placeholder && (
        <option key="placeholder" value="">
          {placeholder}
        </option>
      )}
      {renderedOptions}
    </FieldGroupComponent>
  );
};
SelectFieldGroup.propTypes = {
  // the name of the input. Should match a key in options
  name: PropTypes.string.isRequired,
  // can be specified as either an array (of either Answers or SimpleAnswers, as defined in
  // utils.js) or an object (in which case we'll use the keys for the
  // values and the values for the display names)
  options: PropTypes.arrayOf(PropTypes.string),
  // if specified, will add a valueless option
  // with the specified placeholder text
  placeholder: PropTypes.string,
};

/**
 * Construct a controlled Select dropdown from the options specified in FormContext
 */
export const SelectFieldGroupFromOptions = props => {
  const {options} = useContext(FormContext);
  const {name} = props;
  const componentOptions = options[name];
  return <SelectFieldGroup options={componentOptions} {...props} />;
};
SelectFieldGroupFromOptions.propTypes = {
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
};
