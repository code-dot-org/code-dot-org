import React from 'react';
import { connect } from 'react-redux';

export class CollectorGemCounter extends React.Component {
  static propTypes = {
    currentCollected: React.PropTypes.number.isRequired,
    minRequired: React.PropTypes.number.isRequired,
  }

  render() {
    return (
      <div
        style={{
          width: "100%",
          position: "absolute",
          pointerEvents: "none",
          top: 5,
          left: 0,
          textAlign: 'center',
          fontFamily: '"Gotham 5r"'
        }}
      >
        <div style={{display: 'block'}}>
          <span>Goal</span>
          <hr
            style={{
              margin: '0 auto',
              width: 50
            }}
          />
          <div
            style={{
              backgroundImage: "url(\"/blockly/media/skins/collector/gem.png\")",
              backgroundSize: "100%",
              display: "inline",
              padding: 5
            }}
          >
            <i
              style={{
                color: 'lightgreen',
                lineHeight: '25px',
                fontSize: 18,
                visibility: (this.props.currentCollected >= this.props.minRequired) ? 'visible' : 'hidden',
                position: 'relative',
                left: 5,
                top: 7,
              }}
              className="fa fa-check"
              aria-hidden="true"
            />
          </div>
          <span>{this.props.currentCollected}/{this.props.minRequired}</span>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  currentCollected: state.maze.collectorCurrentCollected,
  minRequired: state.maze.collectorMinRequired,
}))(CollectorGemCounter);
