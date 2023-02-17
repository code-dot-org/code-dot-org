import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

export default function SingleSectionSetUp(getOfferings) {
  const [offerings, setOfferings] = useState('Here are the courses');
  const [marketingAudience, setMarketingAudience] = useState('elementary');

  // Retrieve course offerings on mount
  useEffect(() => {
    const courses = getOfferings;
    setOfferings(courses);
  }, []);

  const toggleMarketingAudience = () => {
    if (marketingAudience !== '') {
      setMarketingAudience('');
    } else {
      setMarketingAudience('elementary');
    }
  };

  return (
    <div>
      <h2>{i18n.assignACurriculum()}</h2>
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
            onClick={() => setMarketingAudience('elementary')}
          />
          <Button
            id={'uitest-middle-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsMiddle()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'middle' ? 'caret-up' : 'caret-down'}
            onClick={() => setMarketingAudience('middle')}
          />
          <Button
            id={'uitest-high-button'}
            style={styles.buttonStyle}
            text={i18n.courseBlocksGradeBandsHigh()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'high' ? 'caret-up' : 'caret-down'}
            onClick={() => setMarketingAudience('high')}
          />
          <Button
            id={'uitest-hoc-button'}
            style={styles.buttonStyle}
            text={i18n.courseOfferingHOC()}
            size={Button.ButtonSize.large}
            icon={marketingAudience === 'hoc' ? 'caret-up' : 'caret-down'}
            onClick={() => setMarketingAudience('hoc')}
          />
          <input
            style={styles.inputStyle}
            type="checkbox"
            id={'decide-later'}
            onChange={toggleMarketingAudience}
          />
          <h5>{i18n.decideLater()}</h5>
        </div>
      </div>
      {marketingAudience === 'high' && [offerings]}
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  getOfferings: PropTypes.func.isRequired
};

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
    margin: '0px 5px 0px 150px'
  }
};
