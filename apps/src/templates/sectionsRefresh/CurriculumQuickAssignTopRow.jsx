import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {memo} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import moduleStyles from './sections-refresh.module.scss';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  HOAI: 'hoai',
  PL: 'pl',
};

const MarketingAudienceButton = memo(
  ({selectedMarketingAudience, audience, determineMarketingAudience, text}) => {
    const isActive = selectedMarketingAudience === audience;
    const icon = isActive ? 'caret-down' : 'caret-right';

    return (
      <Button
        id={`uitest-${audience}-button`}
        className={classnames(
          moduleStyles.buttonStyle,
          isActive && moduleStyles.activeMarketingAudienceButton
        )}
        text={text}
        size={Button.ButtonSize.large}
        icon={icon}
        onClick={() => determineMarketingAudience(audience)}
        type="button"
      />
    );
  }
);

MarketingAudienceButton.propTypes = {
  selectedMarketingAudience: PropTypes.string.isRequired,
  audience: PropTypes.string.isRequired,
  determineMarketingAudience: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

MarketingAudienceButton.displayName = 'MarketingAudienceButton';

export default function CurriculumQuickAssignTopRow({
  showPlOfferings,
  marketingAudience,
  updateMarketingAudience,
}) {
  // If the given audience is already selected, deselect it.
  // Otherwise, set to this audience
  const determineMarketingAudience = newAudience => {
    if (newAudience === marketingAudience) {
      updateMarketingAudience('');
    } else {
      updateMarketingAudience(newAudience);
    }
  };

  return (
    <div className={moduleStyles.buttonRow}>
      <div className={moduleStyles.buttonsInRow}>
        <MarketingAudienceButton
          selectedMarketingAudience={marketingAudience}
          audience={MARKETING_AUDIENCE.ELEMENTARY}
          determineMarketingAudience={determineMarketingAudience}
          text={i18n.courseBlocksGradeBandsElementary()}
        />
        <MarketingAudienceButton
          selectedMarketingAudience={marketingAudience}
          audience={MARKETING_AUDIENCE.MIDDLE}
          determineMarketingAudience={determineMarketingAudience}
          text={i18n.courseBlocksGradeBandsMiddle()}
        />
        <MarketingAudienceButton
          selectedMarketingAudience={marketingAudience}
          audience={MARKETING_AUDIENCE.HIGH}
          determineMarketingAudience={determineMarketingAudience}
          text={i18n.courseBlocksGradeBandsHigh()}
        />
        <MarketingAudienceButton
          selectedMarketingAudience={marketingAudience}
          audience={MARKETING_AUDIENCE.HOC}
          determineMarketingAudience={determineMarketingAudience}
          text={i18n.teacherCourseHoc()}
        />
        <MarketingAudienceButton
          selectedMarketingAudience={marketingAudience}
          audience={MARKETING_AUDIENCE.HOAI}
          determineMarketingAudience={determineMarketingAudience}
          text={i18n.marketingInitiativeHOAI()}
        />
        {showPlOfferings && (
          <MarketingAudienceButton
            selectedMarketingAudience={marketingAudience}
            audience={MARKETING_AUDIENCE.PL}
            determineMarketingAudience={determineMarketingAudience}
            text={i18n.professionalLearning()}
          />
        )}
      </div>
    </div>
  );
}

CurriculumQuickAssignTopRow.propTypes = {
  showPlOfferings: PropTypes.bool.isRequired,
  marketingAudience: PropTypes.string,
  updateMarketingAudience: PropTypes.func.isRequired,
};
