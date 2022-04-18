import {FormControl, FormGroup, HelpBlock} from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const FieldGroup = ({id, label, help, componentClass, children, ...props}) => {
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
      {help && (
        <HelpBlock
          className={classNames(
            'help',
            componentClass === 'select' ? 'dropdown' : 'grey_input'
          )}
        >
          {help}
        </HelpBlock>
      )}
    </FormGroup>
  );
};

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  componentClass: PropTypes.string
};

export default FieldGroup;
