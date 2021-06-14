import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

/**
 * StylizedTabView
 */
export default class StylizedTabView extends React.Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        name: PropTypes.string,
        renderFn: PropTypes.func
      })
    )
  };

  state = {
    activeTab: this.props.tabs[0]
  };

  selectTab(tabInfo) {
    this.setState({activeTab: tabInfo});
  }

  render() {
    return (
      <div>
        <div>
          {this.props.tabs.map(tabInfo => (
            <div
              style={Object.assign(
                {},
                styles.tab,
                this.state.activeTab === tabInfo
                  ? styles.activeTab
                  : styles.inactiveTab
              )}
              key={tabInfo.key}
              onClick={() => this.setState({activeTab: tabInfo})}
            >
              {tabInfo.name}
            </div>
          ))}
        </div>
        {this.state.activeTab && this.state.activeTab.renderFn()}
      </div>
    );
  }
}

const styles = {
  tab: {
    padding: '2px 10px',
    display: 'inline-block',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: '25px'
  },
  activeTab: {
    backgroundColor: color.teal,
    borderRadius: 25,
    color: color.white
  },
  inactiveTab: {
    backgroundColor: color.white,
    color: color.black,
    ':hover': {
      color: color.teal
    }
  }
};
