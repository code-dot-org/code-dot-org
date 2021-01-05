import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const styles = {
  tab: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    color: color.white,
    padding: '5px 10px',
    width: 200
  },
  box: {
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 10
  },
  icon: {
    marginLeft: 7,
    marginRight: 5
  }
};

export const tipTypes = {
  teachingTip: {
    displayName: i18n.teachingTip(),
    icon: 'lightbulb-o',
    color: color.orange,
    backgroundColor: color.lightest_orange
  },
  contentCorner: {
    displayName: i18n.contentCorner(),
    icon: 'graduation-cap',
    color: color.teal,
    backgroundColor: color.lightest_teal
  },
  discussionGoal: {
    displayName: i18n.discussionGoal(),
    icon: 'comments',
    color: color.purple,
    backgroundColor: color.lightest_purple
  },
  assessmentOpportunity: {
    displayName: i18n.assessmentOpportunity(),
    icon: 'check-circle',
    color: color.purple,
    backgroundColor: color.lightest_purple
  }
};

export default class LessonTip extends Component {
  static propTypes = {
    tip: PropTypes.object
  };

  render() {
    return (
      <div>
        <div
          style={{
            ...styles.tab,
            ...{backgroundColor: tipTypes[this.props.tip.type].color}
          }}
        >
          <FontAwesome
            icon={tipTypes[this.props.tip.type].icon}
            style={styles.icon}
          />
          <span>{tipTypes[this.props.tip.type].displayName}</span>
        </div>
        <div
          style={{
            ...styles.box,
            ...{borderColor: tipTypes[this.props.tip.type].color},
            ...{backgroundColor: tipTypes[this.props.tip.type].backgroundColor}
          }}
        >
          <SafeMarkdown markdown={this.props.tip.markdown} />
        </div>
      </div>
    );
  }
}
