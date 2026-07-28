import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from '../lesson-plan.module.scss';

export const tipTypes = {
  teachingTip: {
    displayName: i18n.teachingTip(),
    icon: 'lightbulb',
    iconStyle: 'regular',
    primaryColor: 'var(--background-accent-orange-strong)',
    secondaryColor: 'var(--background-accent-orange-light)',
    // Orange has no analogous border token, so reuse the accent strong color.
    borderColor: 'var(--background-accent-orange-strong)',
  },
  contentCorner: {
    displayName: i18n.contentCorner(),
    icon: 'graduation-cap',
    primaryColor: 'var(--background-brand-teal-strong)',
    secondaryColor: 'var(--background-brand-teal-extra-light)',
    borderColor: 'var(--borders-brand-teal-strong)',
  },
  discussionGoal: {
    displayName: i18n.discussionGoal(),
    icon: 'comments',
    primaryColor: 'var(--background-brand-purple-strong)',
    secondaryColor: 'var(--background-brand-purple-extra-light)',
    borderColor: 'var(--borders-brand-purple-strong)',
  },
  assessmentOpportunity: {
    displayName: i18n.assessmentOpportunity(),
    icon: 'check-circle',
    primaryColor: 'var(--background-brand-purple-strong)',
    secondaryColor: 'var(--background-brand-purple-extra-light)',
    borderColor: 'var(--borders-brand-purple-strong)',
  },
  ethicsOpportunity: {
    displayName: i18n.ethicsOpportunity(),
    icon: 'head-side-heart',
    primaryColor: 'var(--background-info-strong)',
    secondaryColor: 'var(--background-info-extra-light)',
    borderColor: 'var(--borders-info-strong)',
  },
};

class LessonTip extends Component {
  static propTypes = {
    tip: PropTypes.object,
  };

  state = {
    expanded: true,
  };

  render() {
    const {expanded} = this.state;
    const caretIcon = expanded ? 'caret-up' : 'caret-down';
    const {
      primaryColor,
      secondaryColor,
      borderColor,
      icon,
      iconStyle,
      displayName,
    } = tipTypes[this.props.tip.type];
    return (
      <div
        className={styles.tip}
        style={{
          '--tip-primary': primaryColor,
          '--tip-secondary': secondaryColor,
          '--tip-border': borderColor,
        }}
      >
        <div
          className={classNames(
            styles.tab,
            expanded ? styles.expanded : styles.collapsed,
            'unit-test-tip-tab'
          )}
          onClick={() => this.setState({expanded: !expanded})}
        >
          <FontAwesome
            icon={icon}
            iconStyle={iconStyle}
            className={styles.icon}
          />
          <span>{displayName}</span>
          <FontAwesome icon={caretIcon} className={styles.caret} />
        </div>
        {expanded && (
          <div className={styles.box}>
            <SafeMarkdown markdown={this.props.tip.markdown} />
          </div>
        )}
      </div>
    );
  }
}

export default LessonTip;
