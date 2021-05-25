import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import queryString from 'query-string';
import i18n from '@cdo/locale';
import TooltipWithIcon from './TooltipWithIcon';
import {currentLocation} from '../../utils';
import LessonExtrasFlagIcon from './LessonExtrasFlagIcon';

const LARGE_FLAG_SIZE = 24;
const SMALL_FLAG_SIZE = 16;

export default class LessonExtrasProgressBubble extends Component {
  static propTypes = {
    lessonExtrasUrl: PropTypes.string.isRequired,
    isPerfect: PropTypes.bool,
    isSelected: PropTypes.bool
  };

  /**
   * we need to preserve query params for e.g. section and student id, but when
   * we're on an actual bonus level (as opposed to the selection page), the
   * level id is included in the params, so we need to remove it to allow this
   * url to link back to the bonus level selection page.
   */
  getUrl() {
    let url = this.props.lessonExtrasUrl;
    const queryParams = queryString.parse(currentLocation().search);
    delete queryParams.id;
    if (Object.keys(queryParams).length > 0) {
      url = `${url}?${queryString.stringify(queryParams)}`;
    }
    return url;
  }

  render() {
    const {isPerfect, isSelected} = this.props;
    const tooltipId = _.uniqueId();
    return (
      <a
        href={this.getUrl()}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
      >
        <LessonExtrasFlagIcon
          isPerfect={isPerfect}
          isSelected={isSelected}
          size={isSelected ? LARGE_FLAG_SIZE : SMALL_FLAG_SIZE}
        />
        <TooltipWithIcon
          tooltipId={tooltipId}
          icon={'flag-checkered'}
          text={i18n.stageExtras()}
        />
      </a>
    );
  }
}
