/** @file Grid over visualization */
import PropTypes from 'prop-types';
import React from 'react';

export const styles = {
  line: {
    stroke: '#000',
    strokeWidth: 0.8
  },
  semiBoldLine: {
    stroke: '#000',
    strokeWidth: 1.4
  },
  boldLine: {
    stroke: '#000',
    strokeWidth: 4
  },
  show: {
    display: ''
  },
  hide: {
    display: 'none'
  }
};

/**
 * Grid layered over the play space.
 * Should be rendered inside a VisualizationOverlay.
 * @constructor
 */
export default class GridOverlay extends React.Component {
  static propTypes = {
    // width, height, mouseX and mouseY are given in app-space, not screen-space
    width: PropTypes.number,
    height: PropTypes.number,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
    show: PropTypes.bool.isRequired
  };

  render() {
    const shouldShow = this.props.show ? styles.show : styles.hide;
    return (
      <g id="grid-overlay" className="grid-overlay" style={shouldShow}>
        <text x={5} y={15}>
          (0,0)
        </text>
        <text x={5} y={390}>
          (0,400)
        </text>
        <text x={345} y={15}>
          (400,0)
        </text>
        <line x1={1} y1={400} x2={1} y2={0} style={styles.boldLine} />
        <line x1={100} y1={400} x2={100} y2={0} style={styles.semiBoldLine} />
        <line x1={200} y1={400} x2={200} y2={0} style={styles.semiBoldLine} />
        <line x1={300} y1={400} x2={300} y2={0} style={styles.semiBoldLine} />
        <line x1={399} y1={400} x2={399} y2={0} style={styles.semiBoldLine} />
        <line x1={0} y1={1} x2={400} y2={1} style={styles.boldLine} />
        <line x1={0} y1={100} x2={400} y2={100} style={styles.semiBoldLine} />
        <line x1={0} y1={200} x2={400} y2={200} style={styles.semiBoldLine} />
        <line x1={0} y1={300} x2={400} y2={300} style={styles.semiBoldLine} />
        <line x1={0} y1={399} x2={400} y2={399} style={styles.semiBoldLine} />

        <line x1={50} y1={400} x2={50} y2={0} style={styles.line} />
        <line x1={150} y1={400} x2={150} y2={0} style={styles.line} />
        <line x1={250} y1={400} x2={250} y2={0} style={styles.line} />
        <line x1={350} y1={400} x2={350} y2={0} style={styles.line} />
        <line x1={0} y1={50} x2={400} y2={50} style={styles.line} />
        <line x1={0} y1={150} x2={400} y2={150} style={styles.line} />
        <line x1={0} y1={250} x2={400} y2={250} style={styles.line} />
        <line x1={0} y1={350} x2={400} y2={350} style={styles.line} />
      </g>
    );
  }
}
