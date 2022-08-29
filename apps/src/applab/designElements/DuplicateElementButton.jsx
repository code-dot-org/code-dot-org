import React from 'react';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import style from './duplicate-element-button.module.scss';

/**
 * A duplicate button that helps replicate elements
 */
class DuplicateElementButton extends React.Component {
  static propTypes = {
    handleDuplicate: PropTypes.func.isRequired
  };

  handleDuplicate = event => this.props.handleDuplicate();

  render() {
    return (
      <div>
        <button
          type="button"
          className={style.duplicateButton}
          style={commonStyles.button}
          onClick={this.handleDuplicate}
        >
          Duplicate
        </button>
      </div>
    );
  }
}

export default DuplicateElementButton;
