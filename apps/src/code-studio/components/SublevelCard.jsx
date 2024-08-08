import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';

import MazeThumbnail from '@cdo/apps/code-studio/components/lessonExtras/MazeThumbnail';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import {levelType} from '@cdo/apps/templates/progress/progressTypes';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';

export default class SublevelCard extends React.Component {
  static propTypes = {
    isLessonExtra: PropTypes.bool,
    // sublevels generally use "perfect" instead of status
    sublevel: levelType,
    sectionId: PropTypes.number,
    userId: PropTypes.number,
  };

  getSublevelUrl = () => {
    const {isLessonExtra, sublevel, sectionId, userId} = this.props;

    if (isLessonExtra) {
      const baseUrl = location.origin + location.pathname + '?';
      if (sectionId && userId) {
        // Both sectionId and userId are required to link to a student's work on a bonus level.
        return (
          baseUrl +
          queryString.stringify({
            id: sublevel.id,
            section_id: sectionId,
            user_id: userId,
          })
        );
      } else if (sectionId) {
        return (
          baseUrl +
          queryString.stringify({
            id: sublevel.id,
            section_id: sectionId,
          })
        );
      }
      return baseUrl + queryString.stringify({id: sublevel.id});
    }

    return sublevel.url + location.search;
  };

  renderWithMazeThumbnail() {
    return (
      <MazeThumbnail
        size={THUMBNAIL_IMAGE_SIZE}
        mazeSummary={this.props.sublevel.maze_summary}
      />
    );
  }

  renderThumbnail = () => {
    const {sublevel} = this.props;
    if (sublevel.thumbnail_url) {
      // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
      // Verify or update this alt-text as necessary
      return (
        <img src={sublevel.thumbnail_url} style={styles.thumbnail} alt="" />
      );
    } else if (['Maze', 'Karel'].includes(sublevel.type)) {
      return this.renderWithMazeThumbnail();
    } else {
      // Render a square-shaped placeholder if we don't have a thumbnail.
      return (
        <div style={styles.placeholderThumbnail} className="placeholder">
          <FontAwesome
            icon={getIconForLevel(sublevel)}
            style={styles.icon}
            key={sublevel.id}
          />
        </div>
      );
    }
  };

  /* Determine if we should use the normal progress
   * bubble or the lesson extras flag.
   */
  renderBubble = () => {
    const {isLessonExtra, sublevel} = this.props;

    if (isLessonExtra) {
      return (
        <a href={this.getSublevelUrl()}>
          <LessonExtrasFlagIcon isPerfect={sublevel.perfect} size={30} />
        </a>
      );
    }

    let mappedSublevel = sublevel;
    if (mappedSublevel) {
      // ProgressBubble expects level keys to be camelCase (instead of snake case)
      // converting keys to the correct casing here
      mappedSublevel = _.mapKeys(sublevel, (value, key) => _.camelCase(key));
    }

    return (
      <ProgressBubble
        level={mappedSublevel}
        disabled={false}
        hideToolTips={true}
      />
    );
  };

  render() {
    const {sublevel} = this.props;

    return (
      <div
        key={sublevel.id}
        style={styles.row}
        className="uitest-bubble-choice"
      >
        <a href={this.getSublevelUrl()}>{this.renderThumbnail()}</a>
        <div
          style={{
            ...styles.column,
            ...{width: WIDTH - (MARGIN * 2 + THUMBNAIL_IMAGE_SIZE)},
          }}
        >
          <div style={styles.bubbleAndTitle}>
            {this.renderBubble()}
            <a
              href={this.getSublevelUrl()}
              style={styles.title}
              className="sublevel-card-title-uitest"
            >
              {sublevel.display_name}
            </a>
          </div>
          {sublevel.description && (
            <div
              style={styles.description}
              className="sublevel-card-description-uitest"
            >
              <SafeMarkdown markdown={sublevel.description} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const THUMBNAIL_IMAGE_SIZE = 200;
const MARGIN = 10;
const WIDTH = 435;

const styles = {
  row: {
    display: 'flex',
    width: WIDTH,
    marginBottom: MARGIN,
    marginInlineEnd: MARGIN,
    backgroundColor: color.white,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2,
  },
  thumbnail: {
    minWidth: THUMBNAIL_IMAGE_SIZE,
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2,
  },
  placeholderThumbnail: {
    minWidth: THUMBNAIL_IMAGE_SIZE,
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    backgroundColor: color.lighter_gray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2,
  },
  icon: {
    fontSize: THUMBNAIL_IMAGE_SIZE - 50,
    color: color.white,
    opacity: 0.8,
  },
  column: {
    marginLeft: MARGIN * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: MARGIN,
  },
  bubbleAndTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    minHeight: 30,
    fontSize: 16,
    lineHeight: '25px',
    ...fontConstants['main-font-semi-bold'],
    color: color.teal,
    marginBottom: 10,
    marginInlineStart: MARGIN,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    hyphens: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  description: {
    marginTop: 5,
  },
};
