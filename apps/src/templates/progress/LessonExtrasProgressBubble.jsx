import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import {currentLocation} from '../../utils';

import LessonExtrasFlagIcon from './LessonExtrasFlagIcon';
import TooltipWithIcon from './TooltipWithIcon';

const LARGE_FLAG_SIZE = 24;
const SMALL_FLAG_SIZE = 16;

/**
 * The lesson extras URL with the current query (section, student) kept, minus
 * the bonus level's own id, so it links back to the selection page.
 */
export function lessonExtrasHref(lessonExtrasUrl) {
  const queryParams = queryString.parse(currentLocation().search);
  delete queryParams.id;
  return Object.keys(queryParams).length > 0
    ? `${lessonExtrasUrl}?${queryString.stringify(queryParams)}`
    : lessonExtrasUrl;
}

export default class LessonExtrasProgressBubble extends Component {
  static propTypes = {
    lessonExtrasUrl: PropTypes.string.isRequired,
    isPerfect: PropTypes.bool,
    isSelected: PropTypes.bool,
  };

  getUrl() {
    return lessonExtrasHref(this.props.lessonExtrasUrl);
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
        title={i18n.stageExtras()}
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
