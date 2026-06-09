import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from './lesson-tip.module.scss';

export const tipTypes = {
  teachingTip: {
    displayName: i18n.teachingTip(),
    icon: 'lightbulb',
    iconStyle: 'regular',
    color: 'var(--background-accent-orange-strong)',
    backgroundColor: 'var(--background-accent-orange-light)',
  },
  contentCorner: {
    displayName: i18n.contentCorner(),
    icon: 'graduation-cap',
    color: 'var(--background-brand-teal-strong)',
    backgroundColor: 'var(--background-brand-teal-extra-light)',
  },
  discussionGoal: {
    displayName: i18n.discussionGoal(),
    icon: 'comments',
    color: 'var(--background-brand-purple-strong)',
    backgroundColor: 'var(--background-brand-purple-extra-light)',
  },
  assessmentOpportunity: {
    displayName: i18n.assessmentOpportunity(),
    icon: 'check-circle',
    color: 'var(--background-brand-purple-strong)',
    backgroundColor: 'var(--background-brand-purple-extra-light)',
  },
  ethicsOpportunity: {
    displayName: i18n.ethicsOpportunity(),
    icon: 'head-side-heart',
    // TODO: migrate to a semantic token once the designer chooses a green replacement.
    color: 'var(--background-info-strong)',
    backgroundColor: 'var(--background-info-extra-light)',
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
      color: tipColor,
      backgroundColor,
      icon,
      iconStyle,
      displayName,
    } = tipTypes[this.props.tip.type];
    return (
      <div
        className={styles.tip}
        style={{'--tip-color': tipColor, '--tip-bg': backgroundColor}}
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
