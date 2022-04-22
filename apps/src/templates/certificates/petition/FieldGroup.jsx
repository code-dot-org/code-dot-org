import React from 'react';
import {FormControl, FormGroup, HelpBlock} from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const FieldGroup = ({
  id,
  label,
  helpText,
  componentClass,
  children,
  ...props
}) => {
  return (
    <FormGroup controlId={id}>
      {label && <span className="dropdown-label">{label}</span>}
      <FormControl
        componentClass={componentClass}
        className={classNames(
          'field',
          componentClass === 'select' ? 'dropdown' : 'grey_input'
        )}
        {...props}
      >
        {children}
      </FormControl>
      {helpText && (
        <HelpBlock
          className={classNames(
            'help',
            componentClass === 'select' ? 'dropdown' : 'grey_input'
          )}
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

export default FieldGroup;
