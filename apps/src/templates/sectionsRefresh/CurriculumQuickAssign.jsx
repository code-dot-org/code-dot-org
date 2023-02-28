import React, {useState, useEffect} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';
import QuickAssignTable from './QuickAssignTable';

export const MARKETING_AUDIENCE = {
  ELEMENTARY: 'elementary',
  MIDDLE: 'middle',
  HIGH: 'high',
  HOC: 'hoc',
  PL: 'pl'
};

export default function CurriculumQuickAssign() {
  const [courseOfferings, setCourseOfferings] = useState(null);
  const [decideLater, setDecideLater] = useState(false);
  const [marketingAudience, setMarketingAudience] = useState(null);

  // Retrieve course offerings on mount and convert to JSON
  useEffect(() => {
    fetch('/course_offerings/quick_assign_course_offerings')
      .then(response => response.json())
      .then(data => setCourseOfferings(data));
  }, []);

  /*
  When toggling 'decide later', clear out marketing audience or assign one to make
  the table appear again automatically.
  */
  const toggleDecideLater = () => {
    setDecideLater(!decideLater);
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
  const isGradeBand = () => {
    return (
      marketingAudience !== (MARKETING_AUDIENCE.HOC || MARKETING_AUDIENCE.PL)
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
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsElementary()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === MARKETING_AUDIENCE.ELEMENTARY
                ? 'caret-up'
                : 'caret-down'
            }
            onClick={() =>
              updateMarketingAudience(MARKETING_AUDIENCE.ELEMENTARY)
            }
          />
          <Button
            id={'uitest-middle-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsMiddle()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === MARKETING_AUDIENCE.MIDDLE
                ? 'caret-up'
                : 'caret-down'
            }
            onClick={() => updateMarketingAudience(MARKETING_AUDIENCE.MIDDLE)}
          />
          <Button
            id={'uitest-high-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsHigh()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === MARKETING_AUDIENCE.HIGH
                ? 'caret-up'
                : 'caret-down'
            }
            onClick={() => updateMarketingAudience(MARKETING_AUDIENCE.HIGH)}
          />
          <Button
            id={'uitest-hoc-button'}
            style={styles.buttonStyle}
            text={i18n.courseOfferingHOC()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === MARKETING_AUDIENCE.HOC
                ? 'caret-up'
                : 'caret-down'
            }
            onClick={() => updateMarketingAudience(MARKETING_AUDIENCE.HOC)}
          />
          <input
            checked={decideLater}
            style={styles.inputStyle}
            type="checkbox"
            id="decide-later"
            onChange={toggleDecideLater}
          />
          <label style={styles.decideLaterStyle} htmlFor="decide-later">
            {i18n.decideLater()}
          </label>
        </div>
      </div>
      {marketingAudience && isGradeBand && courseOfferings && (
        <QuickAssignTable
          marketingAudience={marketingAudience}
          courseOfferings={courseOfferings}
        />
      )}
    </div>
  );
}

const styles = {
  buttonStyle: {
    backgroundColor: 'white',
    padding: 10,
    color: 'inherit',
    border: 'none',
    fontSize: 14
  },
  inputStyle: {
    margin: '0px 5px 0px 200px'
  },
  decideLaterStyle: {
    marginTop: '5px'
  }
};
