import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

class CommentOptions extends Component {
  static propTypes = {
    menuOptions: PropTypes.array.isRequired
  };

  state = {
    isOpen: false
  };

  selectOptionWrapper = selectAction => {
    this.setState({isOpen: false});
    selectAction();
  };

  render() {
    const {menuOptions} = this.props;
    const {isOpen} = this.state;
    if (menuOptions.length === 0) {
      return;
    }

    return (
      <i
        className="fa fa-ellipsis-h"
        style={styles.ellipsisMenu}
        onClick={() =>
          this.setState({
            isOpen: !isOpen
          })
        }
      >
        {isOpen && (
          <div style={styles.commentOptionsContainer}>
            {menuOptions.map(menuOption => {
              return (
                <div
                  onClick={() => this.selectOptionWrapper(menuOption.onClick)}
                  style={styles.commentOptionContainer}
                  key={menuOption.key}
                >
                  <span
                    style={styles.icon}
                    className={'fa fa-fw fa-' + menuOption.iconClass}
                  />
                  <span style={styles.text}>{menuOption.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </i>
    );
  }
}

export default Radium(CommentOptions);

const styles = {
  commentOptionsContainer: {
    position: 'absolute',
    marginTop: '5px',
    right: '0px',
    zIndex: 1,
    boxShadow: `3px 3px 3px ${color.lighter_gray}`,
    borderRadius: '4px',
    backgroundColor: color.white
  },
  commentOptionContainer: {
    height: '22px',
    fontSize: '14px',
    fontFamily: '"Gotham 5r"',
    color: color.dark_charcoal,
    padding: '5px 12px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray
    },
    display: 'flex',
    alignItems: 'center'
  },
  text: {padding: '0 5px'},
  icon: {fontSize: '18px'},
  ellipsisMenu: {
    fontSize: 18,
    lineHeight: '18px',
    margin: '0 0 0 5px',
    cursor: 'pointer'
  }
};
