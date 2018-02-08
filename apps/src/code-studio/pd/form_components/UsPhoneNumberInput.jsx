import React, {PropTypes} from 'react';
import FieldGroup from './FieldGroup';

const PHONE_NUMBER_REGEX = /(\()?(\(?\d{1,3})?(\) ?)?(\d{1,3})?(-| )?(\d{1,4})?/;

export default class UsPhoneNumberInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]).isRequired,
    value: PropTypes.string,
    validationState: PropTypes.string,
    errorMessage: PropTypes.string,
    required: PropTypes.bool,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      value: UsPhoneNumberInput.coercePhoneNumber(this.props.value)
    };
  }

  /**
   * Returns true if the value is exactly 10 digits and no other characters, otherwise false.
   * @param {string} value - to inspect
   * @returns {boolean}
   */
  static isValid(value) {
    return /^\d{10}$/.test(value);
  }

  /**
   * Coerce raw value into the nearest properly formatted phone number
   * This is to make the typing more natural and flexible.
   * If we instead validate the format explicitly, then it will require entering in the parentheses, space, and dash.
   * On the other hand, if we only accept numbers and reformat ourselves, then editing and deleting become awkward.
   *
   * See the unit tests for examples.
   * @param {String} value - raw value to coerce into a phone number
   * @returns {string} best effort formatted phone number from the supplied value
   */
  static coercePhoneNumber(value) {
    const match = PHONE_NUMBER_REGEX.exec(value);
    let phoneNumber = "";
    if (match) {
      if (match[1] && !match[2]) {
        // opening (
        phoneNumber = match[1];
      } else if (match[2]) {
        // First 3 digits, "(123)"
        phoneNumber = `(${match[2]}`;
        if (match[2].length === 3) {
          // Optional space, "(123) "
          if (match[3] && !match[4]) {
            phoneNumber += match[3];
          } else if (match[4]) {
            // Second set of 3 digits, "(123) 456"
            phoneNumber += `) ${match[4]}`;
            if (match[4].length === 3) {
              if (match[5] && !match[6]) {
                // Optional -, "(123) 456-"
                phoneNumber += "-";
              } else if (match[6]) {
                // Last 4 digits, "(123) 456-7890"
                phoneNumber += `-${match[6]}`;
              }
            }
          }
        }
      }
    }

    return phoneNumber;
  }

  /**
   * Return only digits from the supplied string
   * @param {string} value - supplied string
   * @returns {string} - all digits from the supplied string
   */
  static toJustNumbers(value) {
    return typeof value === "string" ? value.replace(/[^\d]/g, '') : "";
  }

  handleChange = (change) => {
    const phoneNumber = UsPhoneNumberInput.coercePhoneNumber(change[this.props.name]);
    this.setState({
      value: phoneNumber
    });

    const phoneNumberDigits = UsPhoneNumberInput.toJustNumbers(phoneNumber);
    if (this.props.onChange && phoneNumberDigits !== UsPhoneNumberInput.toJustNumbers(this.props.value)) {
      this.props.onChange({
        [this.props.name]: phoneNumberDigits
      });
    }
  };

  render() {
    const {
      name,
      label,
      validationState,
      errorMessage,
      required,
      // pull value and onChange so they don't get included in ...props
      value, onChange, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    return (
      <div>
        <FieldGroup
          key={name}
          id={name}
          type="text"
          label={label}
          validationState={validationState}
          errorMessage={errorMessage}
          onChange={this.handleChange}
          value={this.state.value || ''}
          required={required}
          placeholder="(xxx) xxx-xxxx"
          {...props}
        />
      </div>
    );
  }
}
