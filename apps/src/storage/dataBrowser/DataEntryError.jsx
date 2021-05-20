import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import color from '../../util/color';
import SafeMarkdown from '../../templates/SafeMarkdown';

class DataEntryError extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool.isRequired
  };

  render() {
    return this.props.isVisible ? (
      <div style={styles.bottom}>
        <div style={{...styles.container, ...styles.visible}}>
          <SafeMarkdown markdown={msg.invalidDataEntryTypeError()} />
        </div>
      </div>
    ) : (
      // Blank space so layout stays the same whether or not error is visible.
      <div style={{...styles.container, ...styles.bottom}} />
    );
  }
}

const styles = {
  container: {
    height: 40,
    paddingTop: 12
  },
  visible: {
    background: color.lighter_yellow,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 0
  },
  bottom: {
    paddingBottom: 8
  }
};

export default DataEntryError;
