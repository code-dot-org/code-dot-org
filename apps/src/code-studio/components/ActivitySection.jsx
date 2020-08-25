import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonTip, {tipTypes} from '@cdo/apps/code-studio/components/LessonTip';
import ProgressionDetails from '@cdo/apps/code-studio/components/ProgressionDetails';

const styles = {
  activitySection: {
    display: 'flex',
    flexDirection: 'row'
  },
  tipIcons: {
    display: 'flex',
    flexDirection: 'column',
    width: 20,
    alignItems: 'center'
  },
  tips: {
    display: 'flex',
    flexDirection: 'column',
    width: '40%'
  },
  remarksHeader: {
    marginLeft: 5,
    fontStyle: 'italic'
  }
};

export default class ActivitySection extends Component {
  static propTypes = {
    section: PropTypes.object
  };

  render() {
    const {section} = this.props;

    return (
      <div>
        {section.type === 'description' && <h4>{section.title}</h4>}
        {section.isRemarks && (
          <div>
            <h4>
              <FontAwesome icon="microphone" />
              <span style={styles.remarksHeader}>Remarks</span>
            </h4>
          </div>
        )}
        <div
          style={{
            ...styles.activitySection,
            ...(section.isRemarks && {borderLeft: '5px solid #CCC'})
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
          {section.type === 'description' && (
            <SafeMarkdown markdown={section.text} />
          )}
          {section.type === 'progression' && (
            <ProgressionDetails progression={section} />
          )}
          <div style={styles.tips}>
            {section.tips.map((tip, index) => {
              return <LessonTip key={`tip-${index}`} tip={tip} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}
