import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  container: {
    ...progressStyles.flex,
    ...progressStyles.hoverStyle,
    borderRadius: 20,
    padding: '6px 10px',
    margin: '3px 0px',
    position: 'relative'
  },
  text: {
    ...progressStyles.font,
    fontSize: 12,
    letterSpacing: -0.12
  }
};

class ProgressTableUnpluggedBubble extends React.PureComponent {
  static propTypes = {
    levelStatus: PropTypes.string,
    url: PropTypes.string.isRequired
  };

  render() {
    let style = {
      ...styles.container,
      ...progressStyles.levelProgressStyle(this.props.levelStatus)
    };
    return (
      <a style={progressStyles.link} href={this.props.url}>
        <div style={style}>
          <div style={styles.text}>{i18n.unpluggedActivity()}</div>
        </div>
      </a>
    );
  }
}

export default Radium(ProgressTableUnpluggedBubble);
