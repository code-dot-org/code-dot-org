import React, {Component, PropTypes} from 'react';

class Checkbox extends Component {

  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    setField: PropTypes.func,
  }

  sendToForm = (event) => {
    this.props.setField(this.props.field, event);
  }

  render() {
    const { label, name, checked } = this.props;
    return (
      <div>
        <label>
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={this.sendToForm}
          />
          <span>
            {label}
          </span>
        </label>
      </div>
    );
  }
}

export default Checkbox;
