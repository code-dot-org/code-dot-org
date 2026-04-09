/* React component to handle animation descriptions for screen readers. */
import PropTypes from "prop-types";
import I18n from "../i18n";

function AnimationDescription({ description }) {
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
  );
}

AnimationDescription.propTypes = {
  description: PropTypes.string
};

function TrainingAnimationDescription() {
  return (
    <AnimationDescription
      description={I18n.t("animationDescriptionsTraining")}
    />
  );
}

function TestingAnimationDescription() {
  return (
    <AnimationDescription
      description={I18n.t("animationDescriptionsTesting")}
    />
  );
}

export { TrainingAnimationDescription, TestingAnimationDescription };
