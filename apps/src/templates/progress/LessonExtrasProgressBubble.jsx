import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import {currentLocation} from '../../utils';
import LessonExtrasFlagIcon from './LessonExtrasFlagIcon';

const styles = {
  main: {
    width: 21,
    height: 24
  }
};

export default class LessonExtrasProgressBubble extends Component {
  static propTypes = {
    lessonExtrasUrl: PropTypes.string.isRequired,
    perfect: PropTypes.bool
  };

  render() {
    const {lessonExtrasUrl, perfect} = this.props;

    const tooltipId = _.uniqueId();
    return (
      <a
        href={lessonExtrasUrl + currentLocation().search}
        style={styles.main}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <LessonExtrasFlagIcon perfect={perfect} style={styles.main} />
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={'flag-checkered'}
          text={i18n.stageExtras()}
          // Currently a lesson extra can not also be an assessment so this should always be false
          // TODO (dmcavoy) : When we change the way we mark levels as assessment refactor
          includeAssessmentIcon={false}
        />
      </a>
    );
  }
}
