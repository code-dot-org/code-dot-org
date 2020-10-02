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
    alignItems: 'center'
  },
  tips: {
    display: 'flex',
    flexDirection: 'column'
  },
  remarksHeader: {
    marginLeft: 5,
    fontStyle: 'italic'
  }
};

export default class ActivitySection extends Component {
  static propTypes = {
    section: activitySectionShape
  };

  render() {
    const {section} = this.props;

    const isProgressionSection = section.levels.length > 0;

    const sectionHasTips = section.tips.length > 0;

    return (
      <div>
        {!isProgressionSection && <h4>{section.displayName}</h4>}
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
            {section.slide && (
              <FontAwesome key={`tipIcon-slide`} icon="list-alt" />
            )}
            {section.tips.map((tip, index) => {
              return (
                <FontAwesome
                  key={`tipIcon-${index}`}
                  icon={tipTypes[tip.type].icon}
                />
              );
            })}
          </div>
          {!isProgressionSection && <SafeMarkdown markdown={section.text} />}
          {isProgressionSection && <ProgressionDetails progression={section} />}
          <div style={{...styles.tips, ...(sectionHasTips && {width: '40%'})}}>
            {section.tips.map((tip, index) => {
              return <LessonTip key={`tip-${index}`} tip={tip} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}
