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
  PL: 'pl'
};

export default function CurriculumQuickAssignTopRow({
  isPl,
  marketingAudience,
  updateMarketingAudience
}) {
  return (
    <div className={moduleStyles.buttonRow}>
      <div className={moduleStyles.buttonsInRow}>
        <Button
          id={'uitest-elementary-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsElementary()}
          size={Button.ButtonSize.large}
          icon={
            marketingAudience === MARKETING_AUDIENCE.ELEMENTARY
              ? 'caret-up'
              : 'caret-down'
          }
          onClick={e => {
            e.preventDefault();
            updateMarketingAudience(MARKETING_AUDIENCE.ELEMENTARY);
          }}
        />
        <Button
          id={'uitest-middle-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsMiddle()}
          size={Button.ButtonSize.large}
          icon={
            marketingAudience === MARKETING_AUDIENCE.MIDDLE
              ? 'caret-up'
              : 'caret-down'
          }
          onClick={e => {
            e.preventDefault();
            updateMarketingAudience(MARKETING_AUDIENCE.MIDDLE);
          }}
        />
        <Button
          id={'uitest-high-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseBlocksGradeBandsHigh()}
          size={Button.ButtonSize.large}
          icon={
            marketingAudience === MARKETING_AUDIENCE.HIGH
              ? 'caret-up'
              : 'caret-down'
          }
          onClick={e => {
            e.preventDefault();
            updateMarketingAudience(MARKETING_AUDIENCE.HIGH);
          }}
        />
        <Button
          id={'uitest-hoc-button'}
          className={moduleStyles.buttonStyle}
          text={i18n.courseOfferingHOC()}
          size={Button.ButtonSize.large}
          icon={
            marketingAudience === MARKETING_AUDIENCE.HOC
              ? 'caret-up'
              : 'caret-down'
          }
          onClick={e => {
            e.preventDefault();
            updateMarketingAudience(MARKETING_AUDIENCE.HOC);
          }}
        />
        {isPl && (
          <Button
            id={'uitest-pl-button'}
            className={moduleStyles.buttonStyle}
            text={i18n.professionalLearning()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === MARKETING_AUDIENCE.PL
                ? 'caret-up'
                : 'caret-down'
            }
            onClick={e => {
              e.preventDefault();
              updateMarketingAudience(MARKETING_AUDIENCE.PL);
            }}
          />
        )}
      </div>
    </div>
  );
}

CurriculumQuickAssignTopRow.propTypes = {
  isPl: PropTypes.bool.isRequired,
  marketingAudience: PropTypes.string,
  updateMarketingAudience: PropTypes.func.isRequired
};
