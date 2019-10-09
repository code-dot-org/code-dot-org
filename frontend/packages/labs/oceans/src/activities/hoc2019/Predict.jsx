import React, {PropTypes} from 'react';
import FishGrid from './FishGrid';

export default class Predict extends React.Component {
  static propTypes = {
    trainingData: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    const fishData = props.trainingData.map(datum => {
      return {
        fish: datum,
        isSelected: false,
        // TODO: (maddie) refactor to calculate % confidence
        label: 'like'
      };
    });
    this.state = {fishData};
  }

  render() {
    return <FishGrid fishData={this.state.fishData} cols={3} />;
  }
}
