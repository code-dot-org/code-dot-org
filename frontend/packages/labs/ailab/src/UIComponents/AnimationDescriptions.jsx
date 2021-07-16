/* React component to handle animation descriptions for screen readers. */
import PropTypes from "prop-types";
import React, { Component } from "react";

class AnimationDescription extends Component {
  static propTypes = {
    description: PropTypes.string
  };

  render() {
    const { description } = this.props;

    return (
      <div id="animation-description" aria-live="polite">
        <div id="animation-description-text" style={{ display: 'none' }}>
        <p><strong>Animation Description:</strong>{description}</p>
        </div>
      </div>
    )
  }
}

class TrainingAnimationDescription extends Component {
  render() {
    return (
      <AnimationDescription
        description="Labeled rows from the training dataset go into A.I. bot's open head."
      />
    )
  }
}

class TestingAnimationDescription extends Component {
  render() {
    return (
      <AnimationDescription
        description="A.I. bot scans incoming rows of unlabeled data from the test dataset. As each row moves under A.I. bot's beam, A.I. makes a prediction by adding a value to the label column."
      />
    )
  }
}

export { TrainingAnimationDescription, TestingAnimationDescription };
