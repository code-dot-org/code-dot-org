import React, {PropTypes} from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Row,
  Col
} from 'react-bootstrap';

const REQUIRED = (<span style={{color: 'red'}}>&nbsp;*</span>);

export default class FieldGroup extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value;
    this.props.onChange && this.props.onChange({
      [this.props.id]: value
    });
  }

  renderControl(controlWidth, children, props) {
    return (
      <Col {...controlWidth}>
        <FormControl
          onChange={this.handleChange}
          {...props}
        >
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
            <ControlLabel>{label}{required && REQUIRED}</ControlLabel>
          </Col>
          {inlineControl && this.renderControl(controlWidth, children, props)}
        </Row>
        {
          !inlineControl && (
            <Row>
              {this.renderControl(controlWidth, children, props)}
            </Row>
          )
        }
        <HelpBlock>{errorMessage}</HelpBlock>
      </FormGroup>
    );
  }
}

FieldGroup.defaultProps = {
  labelWidth: {md: 12},
  controlWidth: {md: 12}
};

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  required: PropTypes.bool,
  validationState: PropTypes.string,
  errorMessage: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node),
  onChange: PropTypes.func,
  labelWidth: PropTypes.object,
  controlWidth: PropTypes.object,
  inlineControl: PropTypes.bool
};
