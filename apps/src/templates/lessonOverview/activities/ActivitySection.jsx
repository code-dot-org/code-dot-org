import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonTip, {
  tipTypes
} from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';
import i18n from '@cdo/locale';

const styles = {
  activitySection: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  },
  tipIcons: {
    display: 'flex',
    flexDirection: 'column',
    width: 20,
    padding: 5,
    alignItems: 'center'
  },
  tips: {
    display: 'flex',
    flexDirection: 'column'
  },
  remarksHeader: {
    marginLeft: 5,
    fontStyle: 'italic'
  },
  textAndProgression: {
    display: 'flex',
    flexDirection: 'column'
  }
};

export default class ActivitySection extends Component {
  static propTypes = {
    section: activitySectionShape
  };

  render() {
    const {section} = this.props;

    const sectionHasTips = section.tips.length > 0;

    let tipsTotalLength = 0;
    section.tips.forEach(tip => {
      tipsTotalLength += tip.markdown.length;
    });
    const totalLengthOfSectionText = section.text.length + tipsTotalLength;
    // The width of the tip based on the length of the text of the tip and the activity section
    // The minimum width the activity section can have is 20
    const tipWidth = Math.min(
      Math.round((tipsTotalLength / totalLengthOfSectionText) * 100),
      80
    );

    return (
      <div>
        <h4 id={`activity-section-${section.key}`}>{section.displayName}</h4>
        {section.remarks && (
          <div>
            <h4>
              <FontAwesome icon="microphone" />
              <span style={styles.remarksHeader}>{i18n.remarks()}</span>
            </h4>
          </div>
        )}
        <div
          style={{
            ...styles.activitySection,
            ...(section.remarks && {borderLeft: '5px solid #CCC'})
          }}
        >
          <div style={styles.tipIcons}>
            {section.tips.map((tip, index) => {
              return (
                <FontAwesome
                  key={`tipIcon-${index}`}
                  icon={tipTypes[tip.type].icon}
                  style={{color: tipTypes[tip.type].color}}
                />
              );
            })}
          </div>
          <div
            style={{
              ...styles.textAndProgression,
              ...(sectionHasTips && {width: `${100 - tipWidth}%`})
            }}
          >
            <SafeMarkdown markdown={section.text} />
            {section.scriptLevels.length > 0 && (
              <ProgressionDetails progression={section} />
            )}
          </div>
          <div
            style={{
              ...styles.tips,
              ...(sectionHasTips && {width: `${tipWidth}%`, marginLeft: 5})
            }}
          >
            {section.tips.map((tip, index) => {
              return <LessonTip key={`tip-${index}`} tip={tip} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}
