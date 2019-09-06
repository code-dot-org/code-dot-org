import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import FontAwesome from '../../templates/FontAwesome';
import msg from '@cdo/locale';
import color from '../../util/color';

const styles = {
  tableName: {
    fontFamily: '"Gotham 7r", sans-serif',
    cursor: 'pointer',
    color: color.dark_charcoal
  },
  preview: {
    backgroundColor: color.background_gray,
    borderColor: color.lighter_gray,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '14px',
    padding: '1px 7px 2px',
    height: '30px',
    width: '95px',
    margin: 10,
    marginLeft: 0
  },
  import: {
    backgroundColor: color.orange,
    border: 'none',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: '14px',
    color: color.white,
    padding: '1px 7px 2px',
    height: '30px',
    width: '95px',
    margin: 10,
    marginRight: 0
  },
  collapsibleContainer: {
    paddingLeft: '16px'
  },
  lastUpdated: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: '12px',
    color: color.light_gray
  },
  lastUpdatedTime: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: '12px',
    color: color.light_gray
  }
};

class LibraryTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  };

  state = {
    collapsed: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    return (
      <div>
        <a style={styles.tableName} onClick={this.toggleCollapsed}>
          <FontAwesome className="fa fa-fw" icon={icon} />
          <span>{this.props.name}</span>
        </a>
        {!this.state.collapsed && (
          <div style={styles.collapsibleContainer}>
            <div>
              <span style={styles.lastUpdated}>{msg.lastUpdatedNoTime()}</span>
              <span style={styles.lastUpdatedTime}> 8 hours ago</span>
            </div>
            <div>{this.props.description}</div>
            <div>
              <button style={styles.preview} type="button">
                {msg.preview()}
              </button>
              <button style={styles.import} type="button">
                {msg.import()}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Radium(LibraryTable);
