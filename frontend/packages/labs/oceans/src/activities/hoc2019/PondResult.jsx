import React, {PropTypes} from 'react';
import {Fish} from './SpritesheetFish';

export default class PondResult extends React.Component {
  static propTypes = {
    fishData: PropTypes.array.isRequired
  };

  render() {
    return (
      <div style={styles.pondContainer}>
        {this.props.fishData.map((fishDatum, idx) => (
          <Fish {...fishDatum} transparentBackground={true} key={idx}/>
        ))}
      </div>
    );
  }
}

const styles = {
  pondContainer: {
    backgroundImage: "url('images/underwater-background.jpg')"
  }
};
