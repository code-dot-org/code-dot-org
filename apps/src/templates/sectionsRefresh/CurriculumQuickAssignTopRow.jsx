import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  PL: 'pl',
};

export default function CurriculumQuickAssignTopRow({
  showPlOfferings,
  marketingAudience,
  updateMarketingAudience,
}) {
  // Determines which icon to render for each audience
  const marketingAudienceIcon = audience => {
    return marketingAudience === audience ? 'caret-down' : 'caret-right';
  };

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
        <Button
          id={'uitest-elementary-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsElementary()}
          size={Button.ButtonSize.large}
          icon={marketingAudienceIcon(MARKETING_AUDIENCE.ELEMENTARY)}
          onClick={e => {
            e.preventDefault();
            determineMarketingAudience(MARKETING_AUDIENCE.ELEMENTARY);
          }}
        />
        <Button
          id={'uitest-middle-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsMiddle()}
          size={Button.ButtonSize.large}
          icon={marketingAudienceIcon(MARKETING_AUDIENCE.MIDDLE)}
          onClick={e => {
            e.preventDefault();
            determineMarketingAudience(MARKETING_AUDIENCE.MIDDLE);
          }}
        />
        <Button
          id={'uitest-high-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsHigh()}
          size={Button.ButtonSize.large}
          icon={marketingAudienceIcon(MARKETING_AUDIENCE.HIGH)}
          onClick={e => {
            e.preventDefault();
            determineMarketingAudience(MARKETING_AUDIENCE.HIGH);
          }}
        />
        <Button
          id={'uitest-hoc-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.teacherCourseHoc()}
          size={Button.ButtonSize.large}
          icon={marketingAudienceIcon(MARKETING_AUDIENCE.HOC)}
          onClick={e => {
            e.preventDefault();
            determineMarketingAudience(MARKETING_AUDIENCE.HOC);
          }}
        />
        {showPlOfferings && (
          <Button
            id={'uitest-pl-button'}
            className={moduleStyles.buttonStyle}
            text={i18n.professionalLearning()}
            size={Button.ButtonSize.large}
            icon={marketingAudienceIcon(MARKETING_AUDIENCE.PL)}
            onClick={e => {
              e.preventDefault();
              determineMarketingAudience(MARKETING_AUDIENCE.PL);
            }}
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
