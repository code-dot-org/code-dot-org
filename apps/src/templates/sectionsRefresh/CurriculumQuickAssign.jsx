import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {CourseOfferingMarketingAudience as MarketingAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

export default function SingleSectionSetUp(getOfferings) {
  const [offerings, setOfferings] = useState([{}]);
  const [marketingAudience, setMarketingAudience] = useState([{}]);

  // Retrieve course offerings on mount
  useEffect(() => {
    setOfferings(getOfferings());
  }, []);

  return (
    <div>
      <h2>{i18n.assignCurriculum()}</h2>
      <h5>{i18n.useDropdownMessage()}</h5>
      <div style={styles.buttonRow} className="quick-assign-top-row">
        <div style={styles.buttonsInRow}>
          <Button
            text={i18n.courseBlocksGradeBandsElementary()}
            size={Button.ButtonSize.large}
            style={{marginRight: 10}}
            onClick={setMarketingAudience(MarketingAudience.elementary)}
          />
          <Button
            text={i18n.courseBlocksGradeBandsMiddle()}
            size={Button.ButtonSize.large}
            style={{marginRight: 10}}
            onClick={setMarketingAudience(MarketingAudience.elementary)}
          />
          <Button
            text={i18n.courseBlocksGradeBandsHigh()}
            size={Button.ButtonSize.large}
            style={{marginRight: 10}}
            onClick={setMarketingAudience(MarketingAudience.elementary)}
          />
          <Button
            text={i18n.courseOfferingHOC()}
            size={Button.ButtonSize.large}
            style={{marginRight: 10}}
            onClick={setMarketingAudience(MarketingAudience.elementary)}
          />
        </div>
      </div>
      {marketingAudience === MarketingAudience.High && {offerings}}
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
  }
};
