import React, { Component } from 'react';
import trophy from './images/trophy.svg';

const styles = {
  main: {
    backgroundImage: `url('${trophy}')`,
    backgroundRepeat: 'none',
    width: 21,
    height: 19,
  },
};

export default class StageExtrasProgressBubble extends Component {
  render() {
    return (
      <span
        style={styles.main}
      />
    );
  }
}
