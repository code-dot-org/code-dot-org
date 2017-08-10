import React, {PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from "../../util/color";
import ProjectActionBox from './ProjectActionBox';
import $ from 'jquery';

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
    marginLeft: 96
  },
  cellContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
};

//to do - style it to always be in the center
const QuickActionsCell = React.createClass({
  propTypes: {
    projectData: PropTypes.object
  },

  getInitialState() {
   return {actionsOpen: false};
  },

  toggleActionBox(event) {
    if (!this.state.actionsOpen) {
      this.minimizeOnClickAnywhere();
    }
    this.setState({actionsOpen: !this.state.actionsOpen});
  },

  minimizeOnClickAnywhere: function (event) {
    // The first time we click anywhere, hide any open children
    $(document.body).one('click', function (event) {
      if (event.target === this.refs.actionBox) {
        return;
      }
      this.setState({
        actionsOpen: false
      });
    }.bind(this));
  },

  render() {
    const selectedStyle = this.state.actionsOpen ? styles.selected : styles.nonSelected;
    return (
      <div style={styles.cellContainer}>
        <div
          style={selectedStyle}
          ref={(icon) => { this.icon = icon; }}
        >
          <FontAwesome icon="angle-down" onClick={this.toggleActionBox} />
        </div>
        {this.state.actionsOpen &&
          <ProjectActionBox
            isPublished={this.props.projectData.isPublished}
            style={styles.actionBox}
            ref={(actionBox) => { this.actionBox = actionBox; }}
          />
        }
      </div>
    );
  }
});

export default QuickActionsCell;
