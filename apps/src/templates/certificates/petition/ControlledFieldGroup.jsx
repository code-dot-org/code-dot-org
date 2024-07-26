import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormControl, FormGroup, HelpBlock} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

const stylingForComponent = componentClass =>
  componentClass === 'select' ? 'dropdown' : 'grey_input';

const FieldGroup = ({
  children,
  componentClass,
  helpText,
  id,
  isErrored,
  label,
  ...props
}) => {
  return (
    <FormGroup controlId={id}>
      {label && <span className="dropdown-label">{label}</span>}
      <FormControl
        componentClass={componentClass}
        className={classNames(
          'field',
          isErrored ? 'has-error' : '',
          stylingForComponent(componentClass)
        )}
        {...props}
      >
        {children}
      </FormControl>
      {helpText && (
        <HelpBlock
          className={classNames('help', stylingForComponent(componentClass))}
        >
          {helpText}
        </HelpBlock>
      )}
    </FormGroup>
  );
};

FieldGroup.propTypes = {
  children: PropTypes.node,
  componentClass: PropTypes.string,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  id: PropTypes.string.isRequired,
  isErrored: PropTypes.bool,
  label: PropTypes.string,
};

const ControlledFieldGroup = ({
  id,
  placeholderOrLabel,
  componentClass,
  ...props
}) => {
  const overlappingProps = {
    id: id,
    name: id,
    key: id,
  };
  return componentClass === 'select' ? (
    <FieldGroup
      {...overlappingProps}
      label={placeholderOrLabel}
      componentClass={componentClass}
      {...props}
    />
  ) : (
    <FieldGroup
      {...overlappingProps}
      placeholder={placeholderOrLabel}
      type={'text'}
      {...props}
    />
  );
};

ControlledFieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  placeholderOrLabel: PropTypes.string.isRequired,
  componentClass: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default ControlledFieldGroup;
