import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';
import QuickAssignTable from './QuickAssignTable';
import QuickAssignTableHocPl from './QuickAssignTableHocPl';
import {queryParams} from '@cdo/apps/code-studio/utils';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  PL: 'pl'
};

export default function CurriculumQuickAssign({updateSection, sectionCourse}) {
  const [courseOfferings, setCourseOfferings] = useState(null);
  const [decideLater, setDecideLater] = useState(false);
  const [marketingAudience, setMarketingAudience] = useState(null);

  // Retrieve course offerings on mount and convert to JSON
  useEffect(() => {
    const participantType = queryParams('participantType');
    fetch(
      `/course_offerings/quick_assign_course_offerings?participantType=${participantType}`
    )
      .then(response => response.json())
      .then(data => setCourseOfferings(data));
  }, []);

  /*
  When toggling 'decide later', clear out marketing audience or assign one to make
  the table appear again automatically.
  Additionally, erase any previously selected course assignment.
  */
  const toggleDecideLater = () => {
    setDecideLater(!decideLater);
    updateSection('course', {});
    if (marketingAudience !== '') {
      setMarketingAudience('');
    } else {
      setMarketingAudience(MARKETING_AUDIENCE.ELEMENTARY);
    }
  };

  // When selecting a marketing audience, ensure 'decide later' is unchecked
  const updateMarketingAudience = marketingAudience => {
    setMarketingAudience(marketingAudience);
    setDecideLater(false);
  };

  // To distinguish between types of tables: HOC & PL vs Grade Bands
  const isPlOrHoc = () => {
    return (
      marketingAudience === (MARKETING_AUDIENCE.HOC || MARKETING_AUDIENCE.PL)
    );
  };

  return (
    <div>
      <h3>{i18n.assignACurriculum()}</h3>
      <h5>{i18n.useDropdownMessage()}</h5>
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
          <input
            checked={decideLater}
            className={moduleStyles.input}
            type="checkbox"
            id="decide-later"
            onChange={toggleDecideLater}
          />
          <label className={moduleStyles.decideLater} htmlFor="decide-later">
            {i18n.decideLater()}
          </label>
        </div>
      </div>
      {marketingAudience && !isPlOrHoc() && courseOfferings && (
        <QuickAssignTable
          marketingAudience={marketingAudience}
          courseOfferings={courseOfferings}
          updateCourse={course => updateSection('course', course)}
          sectionCourse={sectionCourse}
        />
      )}
      {marketingAudience && isPlOrHoc() && courseOfferings && (
        <QuickAssignTableHocPl
          marketingAudience={marketingAudience}
          courseOfferings={courseOfferings}
          updateCourse={course => updateSection('course', course)}
          sectionCourse={sectionCourse}
        />
      )}
    </div>
  );
}

CurriculumQuickAssign.propTypes = {
  updateSection: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object
};
