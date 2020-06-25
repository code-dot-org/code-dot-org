import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {getIconForLevel} from '@cdo/apps/templates/progress/progressHelpers';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonExtrasFlagIcon from '@cdo/apps/templates/progress/LessonExtrasFlagIcon';
import MazeThumbnail from '@cdo/apps/code-studio/components/lessonExtras/MazeThumbnail';
import queryString from 'query-string';

const THUMBNAIL_IMAGE_SIZE = 200;
const MARGIN = 10;
const WIDTH = 435;

const styles = {
  row: {
    display: 'flex',
    width: WIDTH,
    marginBottom: MARGIN,
    marginRight: MARGIN,
    backgroundColor: color.white,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2
  },
  thumbnail: {
    minWidth: THUMBNAIL_IMAGE_SIZE,
    width: THUMBNAIL_IMAGE_SIZE,
    height: THUMBNAIL_IMAGE_SIZE,
    border: '1px solid rgb(187, 187, 187)',
    borderRadius: 2
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
    borderRadius: 2
  },
  icon: {
    fontSize: THUMBNAIL_IMAGE_SIZE - 50,
    color: color.white,
    opacity: 0.8
  },
  flagBubble: {
    fontSize: 30,
    height: 30,
    width: 30
  },
  column: {
    marginLeft: MARGIN * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: MARGIN
  },
  bubbleAndTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  title: {
    minHeight: 30,
    fontSize: 16,
    lineHeight: '25px',
    fontFamily: '"Gotham 5r"',
    color: color.teal,
    marginBottom: 10,
    marginLeft: MARGIN,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    hyphens: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  description: {
    marginTop: 5
  }
};

export default class SublevelCard extends React.Component {
  static propTypes = {
    isLessonExtra: PropTypes.bool,
    sublevel: PropTypes.shape({
      id: PropTypes.number.isRequired,
      display_name: PropTypes.string.isRequired,
      description: PropTypes.string,
      thumbnail_url: PropTypes.string,
      url: PropTypes.string.isRequired,
      position: PropTypes.number,
      letter: PropTypes.string,
      perfect: PropTypes.bool,
      type: PropTypes.string,
      maze_summary: PropTypes.object
    }),
    sectionId: PropTypes.number,
    userId: PropTypes.number
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
            user_id: userId
          })
        );
      } else if (sectionId) {
        return (
          baseUrl +
          queryString.stringify({
            id: sublevel.id,
            section_id: sectionId
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
      return <img src={sublevel.thumbnail_url} style={styles.thumbnail} />;
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
        <a style={styles.flagBubble} href={this.getSublevelUrl()}>
          <LessonExtrasFlagIcon
            perfect={sublevel.perfect}
            style={styles.flagBubble}
          />
        </a>
      );
    }

    return (
      <ProgressBubble level={sublevel} disabled={false} hideToolTips={true} />
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
            ...{width: WIDTH - (MARGIN * 2 + THUMBNAIL_IMAGE_SIZE)}
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
              {sublevel.description}
            </div>
          )}
        </div>
      </div>
    );
  }
}
