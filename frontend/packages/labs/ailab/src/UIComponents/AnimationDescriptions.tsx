/* React component to handle animation descriptions for screen readers. */
import I18n from '../i18n';

interface AnimationDescriptionProps {
  description?: string;
}

const AnimationDescription = ({description}: AnimationDescriptionProps) => {
  return (
    <div id="animation-description" aria-live="polite">
      <div id="animation-description-text" style={{display: 'none'}}>
        <p>
          <strong>{I18n.t('animationDescriptionsHeader')}</strong>
          <br />
          {description}
        </p>
      </div>
    </div>
  );
};

const TrainingAnimationDescription = () => {
  return (
    <AnimationDescription
      description={I18n.t('animationDescriptionsTraining')}
    />
  );
};

const TestingAnimationDescription = () => {
  return (
    <AnimationDescription
      description={I18n.t('animationDescriptionsTesting')}
    />
  );
};

export {TrainingAnimationDescription, TestingAnimationDescription};
