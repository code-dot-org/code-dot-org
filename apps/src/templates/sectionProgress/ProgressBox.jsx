import React, { PropTypes, Component } from 'react';
import color from "@cdo/apps/util/color";

const styles = {
  box: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  filler: {
    width: 20
  }
};

export default class ProgressBox extends Component {
  static propTypes = {
    started: PropTypes.bool,
    incomplete: PropTypes.num,
    imperfect: PropTypes.num,
    perfect: PropTypes.num,
  };

  render() {
    const {started, incomplete, imperfect, perfect} = this.props;

    const boxWithBorderStyle = {
      ...styles.box,
      borderColor: started ? color.level_perfect : color.light_gray
    };

    const perfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_perfect,
      height: perfect
    };

    const incompleteLevels = {
      ...styles.filler,
      backgroundColor: color.level_not_tried,
      height: incomplete
    };

    const imperfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_passed,
      height: imperfect
    };

    return (
      <div style={boxWithBorderStyle}>
        <div style={incompleteLevels}/>
        <div style={imperfectLevels}/>
        <div style={perfectLevels}/>
      </div>
    );
  }
}
