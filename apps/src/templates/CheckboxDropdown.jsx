import React from 'react';
import PropTypes from 'prop-types';

/**
 * Construct a dropdown of labeled checkboxes.
 */
class CheckboxDropdown extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired
  };

  render() {
    return (
      <div id={`${this.props.name}-dropdown`} className="dropdown">
        <button
          id={`${this.props.name}-dropdown-button`}
          type="button"
          className="selectbox"
          data-toggle="dropdown"
        >
          {this.props.label}
        </button>
        <ul className="dropdown-menu">
          <form>
            {this.props.options.map(option => {
              return (
                <li
                  key={`${this.props.name}-${option}`}
                  className="checkbox form-group"
                >
                  <input
                    type="checkbox"
                    id={`${this.props.name}-${option}-check`}
                    name={option}
                    value={option}
                    onChange={this.props.onChange}
                  />
                  <label htmlFor={`${this.props.name}-${option}-check`}>
                    {option}
                  </label>
                </li>
              );
            })}
          </form>
        </ul>
      </div>
    );
  }
}

export default CheckboxDropdown;
