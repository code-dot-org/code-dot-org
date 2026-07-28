import Alert from '@code-dot-org/component-library/alert';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import SafeMarkdown from '../../templates/SafeMarkdown';

import moduleStyles from './data-entry-error.module.scss';

class DataEntryError extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div className={moduleStyles.wrapper}>
        {this.props.isVisible && (
          <Alert
            type="warning"
            className={moduleStyles.alert}
            text={<SafeMarkdown markdown={msg.invalidDataEntryTypeError()} />}
          />
        )}
      </div>
    );
  }
}

export default DataEntryError;
