import React from 'react';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import style from './restore-theme-defaults-button.module.scss';

/**
 * A restore theme defaults button
 */
class RestoreThemeDefaultsButton extends React.Component {
  static propTypes = {
    handleRestore: PropTypes.func.isRequired
  };

  render() {
    const {handleRestore} = this.props;
    return (
      <button
        type="button"
        style={{...commonStyles.button}}
        className={style.restoreButton}
        onClick={handleRestore}
      >
        Apply Theme
      </button>
    );
  }
}

export default RestoreThemeDefaultsButton;
