import React, {Component, PropTypes} from 'react';
import color from "../../util/color";
import {sortableSectionShape} from "./shapes.jsx";
import {OverlayTrigger} from 'react-bootstrap';
import SectionActionBox from "./SectionActionBox";

const styles = {
  actionButton:{
    border: '1px solid ' + color.white,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 5,
    color: color.lighter_gray,
    margin: 3
  },
  hoverFocus: {
    backgroundColor: color.lighter_gray,
    border: '1px solid ' + color.light_gray,
    borderRadius: 5,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    color: color.white,
  },
};

export default class SectionActionDropdown extends Component {
  static propTypes = {
    handleEdit: PropTypes.func,
    sectionData: sortableSectionShape.isRequired,
  };

  state = {
    selected: false,
  };

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="bottom"
        onEnter={() => this.setState({selected : true})}
        onExiting={() => this.setState({selected : false})}
        overlay={<SectionActionBox sectionData={this.props.sectionData} handleEdit={this.props.handleEdit}/>}
      >
        <a style={this.state.selected ? {...styles.actionButton, ...styles.hoverFocus} : styles.actionButton}>
          <i className="fa fa-chevron-down"></i>
        </a>
      </OverlayTrigger>
    );
  }
}
