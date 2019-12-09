import React from 'react';
import color from '../../../util/color';

const styles = {
  container: {position: 'relative', textAlign: 'center'},
  text: {
    position: 'absolute',
    width: '100%',
    bottom: '50%',
    fontFamily: '"Gotham 5r", sans-serif, sans-serif',
    fontSize: 20,
    color: color.dark_charcoal
  }
};

class ChartPlaceholder extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <div style={styles.text}>Select values to generate a visualization</div>
        <img src={require('./placeholder.png')} />
      </div>
    );
  }
}

export default ChartPlaceholder;
