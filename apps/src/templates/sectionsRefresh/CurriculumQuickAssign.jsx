import React, {useState, useEffect} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

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
      setMarketingAudience('elementary');
    }
  };

  // When selecting a marketing audience, ensure 'decide later' is unchecked
  const updateMarketingAudience = marketingAudience => {
    setMarketingAudience(marketingAudience);
    setDecideLater(false);
  };

  return (
    <div>
      <h3>{i18n.assignACurriculum()}</h3>
      <h5>{i18n.useDropdownMessage()}</h5>
      <div style={styles.buttonRow} className="quick-assign-top-row">
        <div style={styles.buttonsInRow}>
          <Button
            id={'uitest-elementary-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsElementary()}
            size={Button.ButtonSize.large}
            icon={
              marketingAudience === 'elementary' ? 'caret-up' : 'caret-down'
            }
            onClick={() => updateMarketingAudience('elementary')}
          />
          <Button
            id={'uitest-middle-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsMiddle()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'middle' ? 'caret-up' : 'caret-down'}
            onClick={() => updateMarketingAudience('middle')}
          />
          <Button
            id={'uitest-high-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsHigh()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'high' ? 'caret-up' : 'caret-down'}
            onClick={() => updateMarketingAudience('high')}
          />
          <Button
            id={'uitest-hoc-button'}
            style={styles.buttonStyle}
            text={i18n.courseOfferingHOC()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'hoc' ? 'caret-up' : 'caret-down'}
            onClick={() => updateMarketingAudience('hoc')}
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
      {marketingAudience && courseOfferings && (
        <div>
          <h5>{marketingAudience}</h5>
          {JSON.stringify(courseOfferings[marketingAudience])}
        </div>
      )}
    </div>
  );
}

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  buttonsInRow: {
    display: 'flex',
    alignItems: 'center'
  },
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
