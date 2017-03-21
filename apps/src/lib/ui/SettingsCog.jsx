/** @file Settings menu cog icon */
import React, {Component} from 'react';
import Radium from 'radium';
import msg from '@cdo/locale';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';

class SettingsCog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false
    };
  }

  onClick() {
    console.log('clicked');
  }

  render() {
    const styles = {
      iconContainer: {
        float: 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%',
        cursor: 'pointer',
        color: color.lighter_purple,
        ':hover': {
          color: color.white,
        }
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle',
      }
    };

    return (
      <span style={styles.iconContainer}>
        <FontAwesome
          id="settings-cog"
          icon="cog"
          style={styles.assetsIcon}
          onClick={this.onClick.bind(this)}
          title={msg.settings()}
        />
      </span>
    );
  }
}
export default Radium(SettingsCog);
