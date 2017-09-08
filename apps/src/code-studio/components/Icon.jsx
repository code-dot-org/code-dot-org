import React, {PropTypes} from 'react';

/**
 * A single icon.
 */
export default class Icon extends React.Component {
  static propTypes = {
    iconId: PropTypes.string.isRequired
  };

  render() {
    const styles = {
      root: {
        float: 'left',
        fontSize: '24px',
        width: '32px',
        textAlign: 'center'
      }
    };

    return (
      <i className={'fa fa-' + this.props.iconId} style={styles.root}/>
    );
  }
}

window.dashboard = window.dashboard || {};
window.dashboard.Icon = Icon;
