import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

/**
 * TabView
 */
class TabView extends React.Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        renderFn: PropTypes.func.isRequired
      })
    )
  };

  state = {
    activeTab: this.props.tabs[0]
  };

  render() {
    return (
      <div>
        <div style={styles.tabContainer}>
          {this.props.tabs.map(tabInfo => (
            <div
              style={[
                styles.tab,
                this.state.activeTab === tabInfo
                  ? styles.activeTab
                  : styles.inactiveTab
              ]}
              key={tabInfo.key}
              onClick={() => this.setState({activeTab: tabInfo})}
            >
              {tabInfo.name}
            </div>
          ))}
        </div>
        {this.state.activeTab?.renderFn()}
      </div>
    );
  }
}

const styles = {
  tabContainer: {
    background: color.lightest_gray,
    padding: 10,
    border: '1px solid',
    borderColor: color.lighter_gray
  },
  tab: {
    padding: '2px 16px',
    margin: '0px 4px',
    display: 'inline-block',
    cursor: 'pointer',
    fontSize: 20,
    lineHeight: '28px'
  },
  activeTab: {
    backgroundColor: color.teal,
    borderRadius: 25,
    color: color.white
  },
  inactiveTab: {
    backgroundColor: color.lightest_gray,
    color: color.dark_charcoal,
    ':hover': {
      color: color.teal
    }
  }
};

export default Radium(TabView);
