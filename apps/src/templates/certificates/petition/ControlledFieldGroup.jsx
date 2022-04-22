import React from 'react';
import {FormControl, FormGroup, HelpBlock} from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const stylingForComponent = componentClass =>
  componentClass === 'select' ? 'dropdown' : 'grey_input';

const FieldGroup = ({
  children,
  componentClass,
  helpText,
  id,
  label,
  ...props
}) => {
  return (
    <FormGroup controlId={id}>
      {label && <span className="dropdown-label">{label}</span>}
      <FormControl
        componentClass={componentClass}
        className={classNames('field', stylingForComponent(componentClass))}
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
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  componentClass: PropTypes.string
};

const ControlledFieldGroup = ({
  children,
  componentClass,
  handleChange,
  helpText,
  id,
  placeholderOrLabel,
  value,
  ...props
}) => {
  const overlappingProps = {
    id: id,
    name: id,
    key: id,
    helpText: helpText,
    onChange: handleChange,
    value: value
  };
  return componentClass === 'select' ? (
    <FieldGroup
      {...overlappingProps}
      label={placeholderOrLabel}
      componentClass={componentClass}
      {...props}
    >
      {children}
    </FieldGroup>
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
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  componentClass: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default ControlledFieldGroup;
