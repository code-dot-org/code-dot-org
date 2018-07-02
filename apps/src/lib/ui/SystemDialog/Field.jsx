import React, {PropTypes} from 'react';
import color from '@cdo/apps/util/color';
import {createUuid} from "../../../utils";

/**
 * Field wrapper for a "System" dialog style.
 *
 * Can be given any (or none) of a label, labelDetails, and/or error - all
 * plain text.  They'll be formatted properly and wrap the field as needed.
 * Takes a single child, which should be a form control
 * Will automatically set an id on the input element to bind the label to it
 * properly.
 */
export default class Field extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    labelDetails: PropTypes.node,
    error: PropTypes.any,
    children: PropTypes.element.isRequired,
    style: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.uniqueId = createUuid();
  }

  render() {
    const {label, labelDetails, error, children, style} = this.props;
    return (
      <div
        style={{
          marginBottom: 15,
          ...style,
        }}
      >
        {(label || labelDetails) &&
        <label
          htmlFor={this.uniqueId}
          style={{
            display: 'block',
            color: color.charcoal,
          }}
        >
          {label &&
            <span style={{fontWeight: 'bold', marginRight: '1em'}}>
              {label}
            </span>
          }
          {labelDetails &&
            <span>
              {labelDetails}
            </span>
          }
        </label>
        }
        {React.cloneElement(children, {id: this.uniqueId})}
        {error &&
          <FieldError>
            {error}
          </FieldError>
        }
      </div>
    );
  }
}

const FieldError = ({children}) => (
  <div
    style={{
      color: color.red,
      fontStyle: 'italic',
    }}
  >
    {children}
  </div>
);
FieldError.propTypes = {children: PropTypes.string};

