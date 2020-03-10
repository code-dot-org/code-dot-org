import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import SafeMarkdown from '../../templates/SafeMarkdown';

const styles = {
  visible: {
    background: color.lighter_yellow,
    padding: '1em'
  },
  hidden: {
    height: '3em'
  }
};

class DataEntryWarning extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool.isRequired
  };

  render() {
    return this.props.isVisible ? (
      <div style={styles.visible}>
        <SafeMarkdown markdown={msg.invalidDataEntryTypeWarning()} />
      </div>
    ) : (
      // Blank space so layout stays the same whether or not warning is visible.
      <div style={styles.hidden} />
    );
  }
}

export default DataEntryWarning;
