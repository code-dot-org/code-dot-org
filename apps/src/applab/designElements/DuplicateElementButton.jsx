import PropTypes from 'prop-types';
import React from 'react';

import commonMsg from '@cdo/locale';

import commonStyles from '../../commonStyles';

import style from './duplicate-element-button.module.scss';

/**
 * A duplicate button that helps replicate elements
 */
class DuplicateElementButton extends React.Component {
  static propTypes = {
    handleDuplicate: PropTypes.func.isRequired,
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
          {commonMsg.duplicate()}
        </button>
      </div>
    );
  }
}

export default DuplicateElementButton;
