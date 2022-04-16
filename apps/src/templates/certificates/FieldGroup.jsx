import {FormControl, FormGroup, HelpBlock} from 'react-bootstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const FieldGroup = ({id, label, help, componentClass, children, ...props}) => {
  return (
    <FormGroup controlId={id}>
      {label && (
        <span className={classNames('dropdown', 'label')}>{label}</span>
      )}
      <FormControl
        componentClass={componentClass}
        className={componentClass === 'select' ? 'dropdown' : 'grey_input'}
        {...props}
      >
        {children}
      </FormControl>
      {help && <HelpBlock style={styles.help}>{help}</HelpBlock>}
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

const styles = {
  help: {
    whiteSpace: 'nowrap',
    fontSize: '12px',
    lineHeight: '18px',
    color: 'rgb(91,103,112)',
    marginLeft: '10px'
  }
};

export default FieldGroup;
