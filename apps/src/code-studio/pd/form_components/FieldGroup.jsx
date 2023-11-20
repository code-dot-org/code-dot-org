import PropTypes from 'prop-types';
import React from 'react';
/* eslint-disable no-restricted-imports */
import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Row,
  Col,
} from 'react-bootstrap';
/* eslint-enable no-restricted-imports */

const REQUIRED = <span style={{color: 'red'}}>&nbsp;*</span>;

export default class FieldGroup extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value;
    if (this.props.type === 'number') {
      // We only want numbers out of this text field, and so this regular expression restricts input to
      // digits, a single decimal point, and an optional minus sign at the
      // beginning.
      if (!value.match(/^$|^-?[0-9]*\.?[0-9]*$/)) {
        return;
      }
    }
    this.props.onChange &&
      this.props.onChange({
        [this.props.id]: value,
      });
  }

  renderControl(controlWidth, children, props) {
    // Rather than set an input field's type to number, we leave it as text.
    // The handleChange function will filter its contents to be numbers only.
    const updatedProps = {
      ...props,
      type: props.type === 'number' ? 'text' : props.type,
    };

    return (
      <Col {...controlWidth}>
        <FormControl onChange={this.handleChange} {...updatedProps}>
          {children}
        </FormControl>
      </Col>
    );
  }

  render() {
    const {
      id,
      validationState,
      errorMessage,
      label,
      required,
      // we pull onChange out here just so it doesn't get included in ...props
      onChange, // eslint-disable-line no-unused-vars
      children,
      labelWidth,
      controlWidth,
      inlineControl,
      ...props
    } = this.props;

    return (
      <FormGroup controlId={id} validationState={validationState}>
        <Row>
          <Col {...labelWidth}>
            <ControlLabel>
              {label}
              {required && REQUIRED}
            </ControlLabel>
          </Col>
          {inlineControl && this.renderControl(controlWidth, children, props)}
        </Row>
        {!inlineControl && (
          <Row>{this.renderControl(controlWidth, children, props)}</Row>
        )}
        <HelpBlock>{errorMessage}</HelpBlock>
      </FormGroup>
    );
  }
}

FieldGroup.defaultProps = {
  labelWidth: {md: 12},
  controlWidth: {md: 12},
};

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  required: PropTypes.bool,
  validationState: PropTypes.string,
  errorMessage: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node),
  onChange: PropTypes.func,
  labelWidth: PropTypes.object,
  controlWidth: PropTypes.object,
  inlineControl: PropTypes.bool,
};
