/**
 * Part of form for creating / editing workshop details. Inputs for special options.
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Radio
} from 'react-bootstrap';
import {
  VirtualOnlySubjects,
  MustSuppressEmailSubjects
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {virtualWorkshopTypes} from '../workshopConstants';

export default class WorkshopTypeOptions extends React.Component {
  static propTypes = {
    validation: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    course: PropTypes.string.isRequired,
    showTypeOptionsHelpDisplay: PropTypes.bool.isRequired,
    onMap: PropTypes.bool.isRequired,
    subject: PropTypes.string,
    funded: PropTypes.bool.isRequired,
    fundingType: PropTypes.string,
    fee: PropTypes.string,
    virtual: PropTypes.bool,
    thirdPartyProvider: PropTypes.string,
    suppressEmail: PropTypes.bool,
    inputStyle: PropTypes.object,
    handleRadioChange: PropTypes.func.isRequired,
    handleFundingChange: PropTypes.func.isRequired,
    handleCustomizeFeeChange: PropTypes.func.isRequired,
    handleFieldChange: PropTypes.func.isRequired,
    toggleTypeOptionsHelpDisplay: PropTypes.func.isRequired,
    handleVirtualChange: PropTypes.func.isRequired,
    handleSuppressEmailChange: PropTypes.func.isRequired
  };

  currentVirtualStatus = () => {
    const {virtual, thirdPartyProvider} = this.props;

    // First, check if the third party provider is a valid
    // virtual workshop type.
    if (virtualWorkshopTypes.includes(thirdPartyProvider)) {
      return thirdPartyProvider;
    } else if (virtual) {
      return 'regional';
    } else {
      return 'in_person';
    }
  };

  renderOnMapRadios(validation) {
    return (
      <FormGroup validationState={validation.style.on_map}>
        <ControlLabel>Should this appear on the K-5 workshop map?</ControlLabel>
        <FormGroup>
          <Radio
            checked={this.props.onMap}
            inline
            name="on_map"
            value="yes"
            onChange={this.props.handleRadioChange}
            style={this.props.inputStyle}
            disabled={this.props.readOnly}
          >
            Yes
          </Radio>
          <Radio
            checked={!this.props.onMap}
            inline
            name="on_map"
            value="no"
            onChange={this.props.handleRadioChange}
            style={this.props.inputStyle}
            disabled={this.props.readOnly}
          >
            No
          </Radio>
        </FormGroup>
        <HelpBlock>{validation.help.on_map}</HelpBlock>
      </FormGroup>
    );
  }

  renderFundedSelect(validation) {
    const options = [];
    if (this.props.course === 'CS Fundamentals') {
      options.push(
        {
          value: {funded: true, funding_type: 'partner'},
          text: 'Yes, it is funded. Please pay the Regional Partner.'
        },
        {
          value: {funded: true, funding_type: 'facilitator'},
          text: 'Yes, it is funded. Please pay the Facilitator directly.'
        }
      );
    } else if (this.props.subject !== 'Workshop for Returning Teachers') {
      options.push({
        value: {funded: true, funding_type: null},
        text: 'Yes, it is funded.'
      });
    }
    options.push({
      value: {funded: false, funding_type: null},
      text: 'No, it is not funded.'
    });
    const value = JSON.stringify(_.pick(this.props, ['funded', 'fundingType']));

    return (
      <Row>
        <Col sm={6}>
          <FormGroup validationState={validation.style.funded}>
            <ControlLabel>Is this a Code.org paid workshop?</ControlLabel>
            <FormControl
              componentClass="select"
              id="funded"
              name="funded"
              value={value}
              onChange={this.props.handleFundingChange}
              style={this.props.inputStyle}
              disabled={this.props.readOnly}
            >
              <option />
              {options.map((o, i) => (
                <option key={i} value={JSON.stringify(o.value)}>
                  {o.text}
                </option>
              ))}
            </FormControl>
            <HelpBlock>{validation.help.funded}</HelpBlock>
          </FormGroup>
        </Col>
      </Row>
    );
  }

  renderFeeInput(validation) {
    // If state.fee is null, there is no fee and no custom fee message.
    // If state.fee is '', the user needs to provide a custom fee message.

    const customizeFee = this.props.fee !== null;

    return (
      <FormGroup validationState={validation.style.fee}>
        <ControlLabel>Fee information for participants</ControlLabel>

        <div style={styles.noFeeContainer}>
          <Radio
            checked={!customizeFee}
            inline
            name="customize_fee"
            value="no"
            onChange={this.props.handleCustomizeFeeChange}
            style={this.props.inputStyle}
            disabled={this.props.readOnly}
          >
            No cost!
          </Radio>
        </div>

        <div>
          <Radio
            checked={customizeFee}
            inline
            name="customize_fee"
            value="yes"
            onChange={this.props.handleCustomizeFeeChange}
            style={{...this.props.inputStyle, ...styles.yesFeeRadio}}
            disabled={this.props.readOnly}
          >
            <FormControl
              type="text"
              value={this.props.fee || ''}
              id="fee"
              name="fee"
              onChange={this.props.handleFieldChange}
              maxLength={30}
              style={this.props.inputStyle}
              disabled={this.props.readOnly || !customizeFee}
              placeholder="Fee information"
            />
            <HelpBlock>{validation.help.fee}</HelpBlock>
          </Radio>
        </div>
      </FormGroup>
    );
  }

  render() {
    const {validation} = this.props;
    const isCsf = this.props.course === 'CS Fundamentals';
    const showFeeInput = isCsf;
    const showMapChoice = isCsf;

    return (
      <FormGroup>
        <ControlLabel>
          Workshop Type Options&nbsp;
          {isCsf && (
            <a onClick={this.props.toggleTypeOptionsHelpDisplay}>(help)</a>
          )}
        </ControlLabel>
        <div style={{height: 7}}>&nbsp;</div>
        {this.props.showTypeOptionsHelpDisplay && isCsf && (
          <FormGroup>
            <p>
              If you’d like to make your workshop open to the public, select Yes
              to show it on the K-5 workshop map.
            </p>
            <p>
              Next, please specify if this is a Code.org paid workshop. If it is
              a Code.org paid workshop, select whether payment should be made
              directly to the Facilitator or if the Regional Partner selected is
              responsible for payments to the Facilitator.
            </p>
          </FormGroup>
        )}
        <Row>
          <Col smOffset={1}>
            <Row>
              {showFeeInput && (
                <Col sm={6}>{this.renderFeeInput(validation)}</Col>
              )}
            </Row>
            {showMapChoice && this.renderOnMapRadios(validation)}
            {/* A small gap to resemble the gap below the fee input. */}
            {showFeeInput && <div style={{height: 7}}>&nbsp;</div>}
            {this.renderFundedSelect(validation)}
          </Col>
        </Row>
        <Row>
          <Col sm={5}>
            <FormGroup validationState={validation.style.virtual}>
              <ControlLabel>
                Is this a virtual workshop?
                <HelpTip>
                  <p>Please update your selection if/when your plans change.</p>
                </HelpTip>
              </ControlLabel>
              <SelectIsVirtual
                value={this.currentVirtualStatus()}
                onChange={this.props.handleVirtualChange}
                readOnly={
                  this.props.readOnly ||
                  VirtualOnlySubjects.includes(this.props.subject)
                }
              />
              <HelpBlock>{validation.help.virtual}</HelpBlock>
            </FormGroup>
          </Col>
          <Col sm={5}>
            <FormGroup validationState={validation.style.suppress_email}>
              <ControlLabel>
                Enable workshop reminders?
                <HelpTip>
                  <p>
                    <strong>
                      This functionality is disabled for all academic year
                      workshops.
                    </strong>
                  </p>
                  <p>
                    For in-person CSF workshops, choose if you'd like automated
                    10-day and 3-day pre-workshop reminders to be sent to your
                    participants.
                  </p>
                </HelpTip>
              </ControlLabel>
              <SelectSuppressEmail
                onChange={this.props.handleSuppressEmailChange}
                value={this.props.suppressEmail || false}
                readOnly={
                  this.props.readOnly ||
                  MustSuppressEmailSubjects.includes(this.props.subject)
                }
              />
              <HelpBlock>{validation.help.suppress_email}</HelpBlock>
            </FormGroup>
          </Col>
        </Row>
      </FormGroup>
    );
  }
}

const SelectSuppressEmail = ({value, readOnly, onChange}) => (
  <FormControl
    componentClass="select"
    value={value}
    id="suppress_email"
    name="suppress_email"
    onChange={onChange}
    style={readOnly ? styles.readOnlyInput : undefined}
    disabled={readOnly}
  >
    <option key={false} value={false}>
      Yes, send reminders on my behalf.
    </option>
    <option key={true} value={true}>
      No, I will remind enrollees myself.
    </option>
  </FormControl>
);
SelectSuppressEmail.propTypes = {
  value: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  },
  noFeeContainer: {
    paddingBottom: 7
  },
  yesFeeRadio: {
    width: '100%'
  }
};

const SelectIsVirtual = ({value, readOnly, onChange}) => (
  <FormControl
    componentClass="select"
    value={value}
    id="virtual"
    name="virtual"
    onChange={onChange}
    style={readOnly ? styles.readOnlyInput : undefined}
    disabled={readOnly}
  >
    <option key={'in_person'} value={'in_person'}>
      No, this is an in-person workshop.
    </option>
    <option key={'friday_institute'} value={'friday_institute'}>
      Yes, this is a Code.org-Friday Institute virtual workshop.
    </option>
    <option key={'regional'} value={'regional'}>
      Yes, this is a regional virtual workshop.
    </option>
  </FormControl>
);
SelectIsVirtual.propTypes = {
  value: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};
