/* React component to handle animation descriptions for screen readers. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import I18n from "../i18n";

class AnimationDescription extends Component {
  static propTypes = {
    description: PropTypes.string
  };

  render() {
    const { description } = this.props;

    return (
      <div id="animation-description" aria-live="polite">
        <div id="animation-description-text" style={{ display: 'none' }}>
          <p>
            <strong>{I18n.t("animationDescriptionsHeader")}</strong>
            <br />
            {description}
          </p>
        </div>
      </div>
    )
  }
}

class TrainingAnimationDescription extends Component {
  render() {
    return (
      <AnimationDescription
        description={I18n.t("animationDescriptionsTraining")}
      />
    )
  }
}

class TestingAnimationDescription extends Component {
  render() {
    return (
      <AnimationDescription
        description={I18n.t("animationDescriptionsTesting")}
      />
    )
  }
}

export { TrainingAnimationDescription, TestingAnimationDescription };
