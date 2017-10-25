import React, {Component, PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "../../util/color";
import $ from 'jquery';
import QuickActionsBox from "./QuickActionsBox";

const styles = {
  selected: {
    backgroundColor: color.lighter_gray,
    borderRadius: 3,
    padding: 5,
    width: 9
  },
  nonSelected: {
    padding: 5,
    width: 9
  },
  actionBox: {
    position: 'absolute',
    marginTop: 32,
    marginLeft: 32
  },
  cellContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
};

class QuickActionsCell extends Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired
  };

  state = {actionsOpen: false};

  toggleActionBox = (event) => {
    if (!this.state.actionsOpen) {
      this.minimizeOnClickAnywhere();
    }
    this.setState({actionsOpen: !this.state.actionsOpen});
  };

  minimizeOnClickAnywhere = (event) => {
    // The first time we click anywhere, hide any open children
    $(document.body).one('click', (event) => {
      this.setState({
        actionsOpen: false
      });
    });
  };

  render() {
    const selectedStyle = this.state.actionsOpen ? styles.selected : styles.nonSelected;
    return (
      <div style={styles.cellContainer}>
        <div
          style={selectedStyle}
          ref={icon => this.icon = icon}
          onClick={this.toggleActionBox}
        >
          <FontAwesome icon="angle-down" />
        </div>
        {this.state.actionsOpen &&
          <div
            style={styles.actionBox}
            ref={actionBox => this.actionBox = actionBox}
          >
            <QuickActionsBox>
              {this.props.children}
            </QuickActionsBox>
          </div>
        }
      </div>
    );
  }
}

export default QuickActionsCell;
