import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import styles from './lesson-tip.module.scss';

export const tipTypes = {
  teachingTip: {
    displayName: i18n.teachingTip(),
    icon: 'lightbulb',
    iconStyle: 'regular',
    color: color.orange,
    backgroundColor: color.lightest_orange,
  },
  contentCorner: {
    displayName: i18n.contentCorner(),
    icon: 'graduation-cap',
    color: color.teal,
    backgroundColor: color.lightest_teal,
  },
  discussionGoal: {
    displayName: i18n.discussionGoal(),
    icon: 'comments',
    color: color.purple,
    backgroundColor: color.lightest_purple,
  },
  assessmentOpportunity: {
    displayName: i18n.assessmentOpportunity(),
    icon: 'check-circle',
    color: color.purple,
    backgroundColor: color.lightest_purple,
  },
  ethicsOpportunity: {
    displayName: i18n.ethicsOpportunity(),
    icon: 'head-side-heart',
    color: color.green,
    backgroundColor: color.lighter_green,
  },
};

class LessonTip extends Component {
  static propTypes = {
    tip: PropTypes.object,
  };

  state = {
    expanded: true,
    hovered: false,
  };

  getTabStyle = () => {
    const {expanded, hovered} = this.state;
    const tipColor = tipTypes[this.props.tip.type].color;
    const expandedColors = {color: color.white, backgroundColor: tipColor};
    const collapsedColors = {color: tipColor, backgroundColor: color.white};
    const defaultStyle = expanded ? expandedColors : collapsedColors;
    const hoverStyle = expanded ? collapsedColors : expandedColors;

    return {
      ...defaultStyle,
      borderColor: tipColor,
      ...(hovered ? hoverStyle : {}),
    };
  };

  render() {
    const {expanded} = this.state;
    const caretIcon = expanded ? 'caret-up' : 'caret-down';
    return (
      <div className={styles.tip}>
        <div
          className={classNames(styles.tab, 'unit-test-tip-tab')}
          style={this.getTabStyle()}
          onClick={() => this.setState({expanded: !expanded})}
          onMouseEnter={() => this.setState({hovered: true})}
          onMouseLeave={() => this.setState({hovered: false})}
        >
          <FontAwesome
            icon={tipTypes[this.props.tip.type].icon}
            iconStyle={tipTypes[this.props.tip.type].iconStyle}
            className={styles.icon}
          />
          <span>{tipTypes[this.props.tip.type].displayName}</span>
          <FontAwesome icon={caretIcon} className={styles.caret} />
        </div>
        {expanded && (
          <div
            className={styles.box}
            style={{
              borderColor: tipTypes[this.props.tip.type].color,
              backgroundColor: tipTypes[this.props.tip.type].backgroundColor,
            }}
          >
            <SafeMarkdown markdown={this.props.tip.markdown} />
          </div>
        )}
      </div>
    );
  }
}

export default LessonTip;
